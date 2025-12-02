package com.hieu.identity_service.service;

import com.hieu.identity_service.constant.OtpType;
import com.hieu.identity_service.constant.PredefinedRole;
import com.hieu.identity_service.dto.request.*;
import com.hieu.identity_service.dto.response.*;
import com.hieu.identity_service.entity.RefreshToken;
import com.hieu.identity_service.entity.Role;
import com.hieu.identity_service.entity.User;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.mapper.OtpMapper;
import com.hieu.identity_service.repository.InvalidatedTokenRepository;
import com.hieu.identity_service.repository.RefreshTokenRepository;
import com.hieu.identity_service.repository.RoleRepository;
import com.hieu.identity_service.repository.UserRepository;
import com.hieu.identity_service.repository.httpclient.*;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    RefreshTokenRepository refreshTokenRepository;
    RoleRepository roleRepository;

    OtpMapper otpMapper;

    OtpService otpService;
    ProfileService profileService;
    WalletService walletService;

    OutboundIdentityClient outboundIdentityClient;
    OutboundUserClient outboundUserClient;
    GithubIdentityClient githubIdentityClient;
    GithubUserClient githubUserClient;

    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${jwt.signer-key}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.validation-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @NonFinal
    @Value("${outbound.identity.google.client-id}")
    private String GOOGLE_CLIENT_ID;

    @NonFinal
    @Value("${outbound.identity.google.client-secret}")
    private String GOOGLE_CLIENT_SECRET;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    private String REDIRECT_URI;

    @NonFinal
    private final String GRANT_TYPE = "authorization_code";

    @NonFinal
    @Value("${outbound.identity.github.client-id}")
    private String GITHUB_CLIENT_ID;

    @NonFinal
    @Value("${outbound.identity.github.client-secret}")
    private String GITHUB_CLIENT_SECRET;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String input = request.getIdentifier();

        User user = userRepository.findByUsername(input).orElse(null);

        if (user == null) {
            user = userRepository.findByEmail(input)
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if(Boolean.FALSE.equals(user.getEmailVerified())){
            OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                    .recipient(user.getEmail())
                    .otpType(OtpType.EMAIL_VERIFICATION.name())
                    .build();

            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();

            return AuthenticationResponse.builder()
                    .recipient(user.getEmail())
                    .requireVerifyEmail(true)
                    .build();
        }

        if (Boolean.FALSE.equals(user.getIsActive()))
            throw new AppException(ErrorCode.DEACTIVATED_USER);

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                    .recipient(user.getEmail())
                    .otpType(OtpType.TWO_FACTOR_AUTH.name())
                    .build();

//            try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
            return AuthenticationResponse.builder()
                    .recipient(user.getEmail())
                    .require2FA(true)
                    .build();
//            } catch (FeignException exception) {
//                throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//            }
        }

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .require2FA(false)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthenticationResponse outboundAuthenticate(String code) {
        var response = outboundIdentityClient.exchangeToken(ExchangeTokenRequest.builder()
                .clientId(GOOGLE_CLIENT_ID)
                .clientSecret(GOOGLE_CLIENT_SECRET)
                .code(code)
                .redirectUri(REDIRECT_URI)
                .grantType(GRANT_TYPE)
                .build());

        log.info("Token response: {}", response);

        var userInfo = outboundUserClient.getUserInfo("json", response.getAccessToken());

        log.info("User info: {}", userInfo);

        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        User user = userRepository.findByEmail(userInfo.getEmail()).orElse(null);

        if (user != null && !user.getEmailVerified()) {
            userRepository.delete(user);
        }

        user = userRepository.findByGoogleAccountId(userInfo.getId())
                .orElseGet(() -> {
                    try {
                        User newUser = userRepository.save(User.builder()
                                .googleAccountId(userInfo.getId())
                                .email(userInfo.getEmail())
                                .emailVerified(true)
                                .isActive(true)
                                .twoFactorEnabled(false)
                                .tokenVersion(0)
                                .roles(roles)
                                .build());

                        profileService.createProfile(ProfileCreationRequest.builder()
                                .userId(newUser.getId())
                                .fullName(userInfo.getName())
                                .build());

                        WalletCreationRequest walletCreationRequest = WalletCreationRequest.builder()
                                .userId(newUser.getId())
                                .build();

                        var walletResponse = walletService.createWallet(walletCreationRequest);

                        return newUser;
                    } catch (DataIntegrityViolationException exception) {
                        throw new AppException(ErrorCode.LOGIN_AND_LINK_REQUIRED);
                    }
                });

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.DEACTIVATED_USER);
        }

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                    .recipient(user.getEmail())
                    .otpType(OtpType.TWO_FACTOR_AUTH.name())
                    .build();

//            try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
//            } catch (FeignException exception) {
//                throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//            }

            return AuthenticationResponse.builder()
                    .require2FA(true)
                    .recipient(user.getEmail())
                    .build();
        }

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .require2FA(false)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticateGithub(String code) {
        var response = githubIdentityClient.exchangeToken(GithubTokenRequest.builder()
                .code(code)
                .clientId(GITHUB_CLIENT_ID)
                .clientSecret(GITHUB_CLIENT_SECRET)
                .redirectUri(REDIRECT_URI)
                .build());

        log.info("TOKEN RESPONSE: {}", response);

        var userInfo = githubUserClient.getUserInfo("Bearer " + response.getAccessToken());
        var userEmail = githubUserClient.getUserEmail("Bearer " + response.getAccessToken());

        log.info("User info: {}", userInfo);
        log.info("User email: {}", userEmail);


        String email = userEmail.stream()
                .filter(githubEmail -> githubEmail.getPrimary() && githubEmail.getVerified())
                .map(GithubEmailResponse::getEmail)
                .findFirst().orElse(null);

        log.info("Email: {}", email);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && !user.getEmailVerified())
            userRepository.delete(user);

        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user = userRepository.findByGithubAccountId(userInfo.getId())
                .orElseGet(() -> {
                    try {
                        User newUser = userRepository.save(User.builder()
                                .githubAccountId(userInfo.getId())
                                .email(email)
                                .emailVerified(true)
                                .isActive(true)
                                .twoFactorEnabled(false)
                                .tokenVersion(0)
                                .roles(roles)
                                .build());

                        profileService.createProfile(ProfileCreationRequest.builder()
                                .userId(newUser.getId())
                                .fullName(userInfo.getName())
                                .build());

                        WalletCreationRequest walletCreationRequest = WalletCreationRequest.builder()
                                .userId(newUser.getId())
                                .build();

                        var walletResponse = walletService.createWallet(walletCreationRequest);

                        return newUser;
                    } catch (DataIntegrityViolationException exception) {
                        throw new AppException(ErrorCode.LOGIN_AND_LINK_REQUIRED);
                    }
                });

        if (Boolean.FALSE.equals(user.getIsActive()))
            throw new AppException(ErrorCode.DEACTIVATED_USER);

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                    .recipient(user.getEmail())
                    .otpType(OtpType.TWO_FACTOR_AUTH.name())
                    .build();

//            try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
//            } catch (FeignException exception) {
//                throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//            }

            return AuthenticationResponse.builder()
                    .require2FA(true)
                    .recipient(user.getEmail())
                    .build();
        }

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .require2FA(false)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void linkGoogleAccount(String code) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (StringUtils.hasText(user.getGoogleAccountId()))
            throw new AppException(ErrorCode.ACCOUNT_LINKED_GOOGLE);

        var tokenResponse = outboundIdentityClient.exchangeToken(ExchangeTokenRequest.builder()
                .code(code)
                .clientId(GOOGLE_CLIENT_ID)
                .clientSecret(GOOGLE_CLIENT_SECRET)
                .redirectUri(REDIRECT_URI)
                .grantType(GRANT_TYPE)
                .build());

        var userInfo = outboundUserClient.getUserInfo("json", tokenResponse.getAccessToken());

        log.info("User info: {}", userInfo);

        user.setGoogleAccountId(userInfo.getId());

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.GOOGLE_ACCOUNT_EXISTED);
        }
    }

    public void linkGithubAccount(String code) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (StringUtils.hasText(user.getGithubAccountId()))
            throw new AppException(ErrorCode.ACCOUNT_LINKED_GITHUB);

        var tokenResponse = githubIdentityClient.exchangeToken(GithubTokenRequest.builder()
                .code(code)
                .clientId(GITHUB_CLIENT_ID)
                .clientSecret(GITHUB_CLIENT_SECRET)
                .redirectUri(REDIRECT_URI)
                .build());

        var userInfo = githubUserClient.getUserInfo("Bearer " + tokenResponse.getAccessToken());

        log.info("User info: {}", userInfo);

        user.setGithubAccountId(userInfo.getId());

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.GITHUB_ACCOUNT_EXISTED);
        }
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        String token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException | ParseException | JOSEException exception) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    public void logout(LogoutRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findById(request.getRefreshToken()).orElse(null);

        if (refreshToken != null && refreshToken.getExpiryTime().isAfter(Instant.now()))
            refreshTokenRepository.delete(refreshToken);

//        try {
//            SignedJWT signedJWT = verifyToken(request.getToken());
//
//            String jti = signedJWT.getJWTClaimsSet().getJWTID();
//            var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
//
//            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
//                    .id(jti)
//                    .expiryTime(expiryTime.toInstant())
//                    .build();
//
//            invalidatedTokenRepository.save(invalidatedToken);
//        } catch (JOSEException | ParseException e) {
//            log.info("Token invalid");
//        } catch (AppException e) {
//            log.info("Token already expired");
//        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) {
        String token = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findById(token)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!refreshToken.getExpiryTime().isAfter(Instant.now()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        refreshTokenRepository.delete(refreshToken);

        String refreshTokenReturn = generateRefreshToken(user);
        String accessToken = generateAccessToken(user);

        return AuthenticationResponse.builder()
                .refreshToken(refreshTokenReturn)
                .accessToken(accessToken)
                .build();
    }

    public AuthenticationResponse verify2FA(TwoFactorVerifyRequest request) {
        User user = userRepository.findByEmail(request.getRecipient())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        VerifyOtpRequest verifyOtpRequest = otpMapper.toVerifyOtpRequest(request);
        verifyOtpRequest.setOtpType(OtpType.TWO_FACTOR_AUTH.name());

//        try {
        var response = otpService.verifyOtp(verifyOtpRequest).getResult();
//        } catch (FeignException exception) {
//            throw new AppException(ErrorCode.CANNOT_VERIFY_OTP);
//        }

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void sendTwoFactorOtp(TwoFactorOtpRequest request) {

        User user = userRepository.findByEmail(request.getRecipient()).orElse(null);

        if (user != null && user.getTwoFactorEnabled() && Boolean.TRUE.equals(user.getIsActive())) {
            OtpCreationRequest otpCreationRequest = otpMapper.toOtpCreationRequest(request);
            otpCreationRequest.setOtpType(OtpType.TWO_FACTOR_AUTH.name());

//            try {
            var responseOtp = otpService.createOtp(otpCreationRequest).getResult();
//            } catch (FeignException exception) {
//                throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//            }
        }
    }

    public EmailVerificationOtpResponse sendEmailVerificationOtp(EmailVerificationOtpRequest request) {
        User user = userRepository.findByEmail(request.getRecipient())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getEmailVerified())
            throw new AppException(ErrorCode.EMAIL_VERIFIED);

        OtpCreationRequest otpCreationRequest = otpMapper.toOtpCreationRequest(request);
        otpCreationRequest.setOtpType(OtpType.EMAIL_VERIFICATION.name());

//        try {
        var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
        return otpMapper.toEmailVerificationOtpResponse(otpResponse);
//        } catch (FeignException exception) {
//            throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//        }
    }

    public AuthenticationResponse verifyEmail(EmailVerificationRequest request) {
        User user = userRepository.findByEmail(request.getRecipient())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (Boolean.TRUE.equals(user.getEmailVerified()))
            throw new AppException(ErrorCode.EMAIL_VERIFIED);

        VerifyOtpRequest verifyOtpRequest = otpMapper.toVerifyOtpRequest(request);
        verifyOtpRequest.setOtpType(OtpType.EMAIL_VERIFICATION.name());

//        try {
        var response = otpService.verifyOtp(verifyOtpRequest).getResult();
//        } catch (FeignException exception) {
//            throw new AppException(ErrorCode.CANNOT_VERIFY_OTP);
//        }

        user.setEmailVerified(true);
        user.setIsActive(true);

        user = userRepository.save(user);

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private String generateAccessToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("hieu.com")
                .subject(user.getId())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .claim("scope", buildScope(user))
                .claim("version", user.getTokenVersion())
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token ", e);
            throw new RuntimeException(e);
        }
    }

    private String generateRefreshToken(User user) {
        String refreshToken = UUID.randomUUID().toString();

        refreshTokenRepository.save(RefreshToken.builder()
                .id(refreshToken)
                .userId(user.getId())
                .issueTime(Instant.now())
                .expiryTime(Instant.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS))
                .build());

        return refreshToken;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });
        }

        return stringJoiner.toString();
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        boolean verified = signedJWT.verify(jwsVerifier);
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        if (!(verified && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

//        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
//            throw new AppException(ErrorCode.UNAUTHENTICATED);

        User user = userRepository.findById(signedJWT.getJWTClaimsSet().getSubject())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getTokenVersion() != signedJWT.getJWTClaimsSet().getLongClaim("version"))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

//    private String maskEmail(String email){
//        var parts = email.split("@");
//        var local = parts[0];
//        var domain = parts[1];
//
//        if(local.length() <= 2)
//            return "***@" + domain;
//
//        String prefix = local.substring(0, 2);
//        String suffix = local.substring(local.length() - 2);
//
//        return prefix + "***" + suffix + "@" + domain;
//    }
}

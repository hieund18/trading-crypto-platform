package com.hieu.identity_service.service;

import com.hieu.identity_service.constant.OtpType;
import com.hieu.identity_service.constant.PredefinedRole;
import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.*;
import com.hieu.identity_service.dto.response.EmailVerificationOtpResponse;
import com.hieu.identity_service.dto.response.UserResponse;
import com.hieu.identity_service.dto.response.VerifyForgotPasswordOtpResponse;
import com.hieu.identity_service.entity.ResetToken;
import com.hieu.identity_service.entity.Role;
import com.hieu.identity_service.entity.User;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.mapper.OtpMapper;
import com.hieu.identity_service.mapper.ProfileMapper;
import com.hieu.identity_service.mapper.UserMapper;
import com.hieu.identity_service.repository.RefreshTokenRepository;
import com.hieu.identity_service.repository.ResetTokenRepository;
import com.hieu.identity_service.repository.RoleRepository;
import com.hieu.identity_service.repository.UserRepository;
import com.hieu.identity_service.repository.httpclient.OtpClient;
import com.hieu.identity_service.repository.httpclient.ProfileClient;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    RefreshTokenRepository refreshTokenRepository;
    ResetTokenRepository resetTokenRepository;

    UserMapper userMapper;
    OtpMapper otpMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;

    ProfileService profileService;
    OtpService otpService;

    @NonFinal
    @Value("${jwt.reset-duration}")
    private long RESET_DURATION;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {

//        if(userRepository.existsByEmail(request.getEmail()) && is)

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        user.setEmailVerified(false);
        user.setIsActive(false);
        user.setTwoFactorEnabled(false);
        user.setTokenVersion(0);

        try {
            user = userRepository.save(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            String message = exception.getMostSpecificCause().getMessage();
            log.info("Message: {}", message);

            if (message.contains("users.username")) {
                throw new AppException(ErrorCode.USERNAME_EXISTED);
            } else if (message.contains("users.email")) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        ProfileCreationRequest profileCreationRequest = profileMapper.toProfileCreationRequest(request);
        profileCreationRequest.setUserId(user.getId());

//        try {
        var profileResponse = profileService.createProfile(profileCreationRequest).getResult();
//        } catch (FeignException | CallNotPermittedException exception) {
//            log.info("Error while create profile", exception);
//            throw new AppException(ErrorCode.CANNOT_CREATE_PROFILE);
//        }

        OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                .recipient(request.getEmail())
                .otpType(OtpType.EMAIL_VERIFICATION.name())
                .build();

        try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
        } catch (AppException exception) {
            log.error("Error while send otp", exception);

            try {
                profileService.deleteProfileByUserId(user.getId());
            } catch (FeignException e) {
                log.error("Error while delete profile", exception);
            }

            throw exception;
        }

        return userMapper.toUserResponse(user);
    }

    public void createUsernamePassword(UsernamePasswordCreationRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (StringUtils.hasText(user.getPassword()))
            throw new AppException(ErrorCode.PASSWORD_EXISTED);

        if (StringUtils.hasText(user.getUsername()))
            throw new AppException(ErrorCode.USERNAME_EXISTED);

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
    }

    public UserResponse getUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> getUsers(int page, int size) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

        var pageData = userRepository.findAll(pageable);

        return PageResponse.fromPage(pageData.map(userMapper::toUserResponse));
    }

    public UserResponse getMyInfo() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserResponse userResponse = userMapper.toUserResponse(user);

        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        return userResponse;
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new AppException(ErrorCode.INVALID_CURRENT_PASSWORD);

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);

        userRepository.save(user);

        refreshTokenRepository.deleteAllByUserId(userId);
    }

    public UserResponse updateUserRoles(String userId, UserRoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var roles = roleRepository.findAllById(request.getRoleId());
        user.setRoles(new HashSet<>(roles));

        user.setTokenVersion(user.getTokenVersion() + 1);

        user = userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setIsActive(!user.getIsActive());

        user.setTokenVersion(user.getTokenVersion() + 1);

        user = userRepository.save(user);

        refreshTokenRepository.deleteAllByUserId(userId);

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse update2FA() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!StringUtils.hasText(user.getEmail()) || Boolean.FALSE.equals(user.getEmailVerified()))
            throw new AppException(ErrorCode.CANNOT_ENABLE_2FA);

        user.setTwoFactorEnabled(!user.getTwoFactorEnabled());
        userRepository.save(user);

        refreshTokenRepository.deleteAllByUserId(userId);

        return userMapper.toUserResponse(user);
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

    public UserResponse verifyEmail(EmailVerificationRequest request) {
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

        return userMapper.toUserResponse(user);
    }

    public void sendForgotPasswordOtp(ForgotPasswordOtpRequest request) {

        User user = userRepository.findByEmail(request.getRecipient()).orElse(null);

        if (user != null && StringUtils.hasText(user.getPassword())) {
            OtpCreationRequest otpCreationRequest = otpMapper.toOtpCreationRequest(request);
            otpCreationRequest.setOtpType("a");

//            try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
//            } catch (FeignException exception) {
//                throw new AppException(ErrorCode.CANNOT_SEND_OTP);
//            }
        }
    }

    public VerifyForgotPasswordOtpResponse verifyForgotPasswordOtp(VerifyForgotPasswordOtpRequest request) {

        VerifyOtpRequest verifyOtpRequest = otpMapper.toVerifyOtpRequest(request);
        verifyOtpRequest.setOtpType(OtpType.FORGOT_PASSWORD.name());

//        try {
        var response = otpService.verifyOtp(verifyOtpRequest).getResult();
//        } catch (FeignException exception) {
//            throw new AppException(ErrorCode.CANNOT_VERIFY_OTP);
//        }

        ResetToken resetToken = ResetToken.builder()
                .id(UUID.randomUUID().toString())
                .email(request.getRecipient())
                .expiryTime(Instant.now().plus(RESET_DURATION, ChronoUnit.SECONDS))
                .build();

        resetTokenRepository.save(resetToken);

        return VerifyForgotPasswordOtpResponse.builder()
                .resetToken(resetToken.getId())
                .build();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);

        ResetToken resetToken = resetTokenRepository.findById(request.getResetToken())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!resetToken.getExpiryTime().isAfter(Instant.now()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        resetTokenRepository.deleteById(request.getResetToken());
        refreshTokenRepository.deleteAllByUserId(user.getId());
    }

//    private boolean isEmailVerified(String email) {
//        User user = userRepository.findByEmail(email).orElse(null);
//
//        return user == null || user.getEmailVerified();
//    }
}

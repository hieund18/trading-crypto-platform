package com.hieu.wallet_service.service;

import com.hieu.wallet_service.constant.OtpType;
import com.hieu.wallet_service.constant.TransactionType;
import com.hieu.wallet_service.constant.WithdrawalStatus;
import com.hieu.wallet_service.dto.PageResponse;
import com.hieu.wallet_service.dto.request.*;
import com.hieu.wallet_service.dto.response.TransferResponse;
import com.hieu.wallet_service.dto.response.WalletResponse;
import com.hieu.wallet_service.dto.response.WalletTransactionResponse;
import com.hieu.wallet_service.dto.response.WithdrawalResponse;
import com.hieu.wallet_service.entity.Transfer;
import com.hieu.wallet_service.entity.Wallet;
import com.hieu.wallet_service.entity.WalletTransaction;
import com.hieu.wallet_service.entity.Withdrawal;
import com.hieu.wallet_service.exception.AppException;
import com.hieu.wallet_service.exception.ErrorCode;
import com.hieu.wallet_service.mapper.TransferMapper;
import com.hieu.wallet_service.mapper.WalletMapper;
import com.hieu.wallet_service.mapper.WalletTransactionMapper;
import com.hieu.wallet_service.mapper.WithdrawalMapper;
import com.hieu.wallet_service.repository.TransferRepository;
import com.hieu.wallet_service.repository.WalletRepository;
import com.hieu.wallet_service.repository.WalletTransactionRepository;
import com.hieu.wallet_service.repository.WithdrawalRepository;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WalletService {
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;
    WithdrawalRepository withdrawalRepository;
    TransferRepository transferRepository;

    WalletMapper walletMapper;
    WithdrawalMapper withdrawalMapper;
    WalletTransactionMapper walletTransactionMapper;
    TransferMapper transferMapper;

    OtpService otpService;
    IdentityService identityService;

    public WalletResponse createWallet(WalletCreationRequest request) {
        Wallet wallet = walletMapper.toWallet(request);

        wallet.setBalance(BigDecimal.ZERO);
        wallet = walletRepository.save(wallet);

        return walletMapper.toWalletResponse(wallet);
    }

    public WalletResponse getMyWallet() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return walletMapper.toWalletResponse(wallet);
    }

    public PageResponse<WalletTransactionResponse> getMyWalletTransaction(Pageable pageable) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());
        var pageData = walletTransactionRepository.findAllByUserId(pageRequest, userId);

        return PageResponse.fromPage(pageData.map(walletTransactionMapper::toWalletTransactionResponse));
    }

    @Transactional
    public WalletResponse deposit(DepositRequest request) {
        BigDecimal amount = request.getAmount();

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        wallet.setBalance(oldBalance.add(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.DEPOSIT.name())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());

        return walletMapper.toWalletResponse(wallet);
    }

    public WithdrawalResponse createWithdraw(WithdrawalCreationRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getAmount().compareTo(wallet.getBalance()) > 0)
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

        withdrawalRepository.deleteAll(withdrawalRepository.findAllByUserIdAndStatus(userId, WithdrawalStatus.PENDING_OTP.name()));

        Withdrawal withdrawal = withdrawalMapper.toWithdrawal(request);
        withdrawal.setUserId(userId);
        withdrawal.setStatus(WithdrawalStatus.PENDING_OTP.name());

        withdrawal = withdrawalRepository.save(withdrawal);

        return withdrawalMapper.toWithdrawalResponse(withdrawal);
    }

    public void sendWithdrawOtp() {
        var userResponse = identityService.getMyInfo().getResult();

        OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                .recipient(userResponse.getEmail())
                .otpType(OtpType.WITHDRAW.name())
                .build();

        try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_SEND_OTP);
        }
    }

    @Transactional
    public WithdrawalResponse verifyWithdraw(VerifyWithdrawRequest request) {
        Withdrawal withdrawal = withdrawalRepository.findById(request.getWithdrawId())
                .orElseThrow(() -> new AppException(ErrorCode.WITHDRAWAL_NOT_EXISTED));

        if (!withdrawal.getStatus().equals(WithdrawalStatus.PENDING_OTP.name()))
            throw new AppException(ErrorCode.INVALID_WITHDRAWAL);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        BigDecimal amount = withdrawal.getAmount();

        if (amount.compareTo(oldBalance) > 0)
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

        var userResponse = identityService.getMyInfo().getResult();

        VerifyOtpRequest verifyOtpRequest = VerifyOtpRequest.builder()
                .otpCode(request.getOtpCode())
                .recipient(userResponse.getEmail())
                .otpType(OtpType.WITHDRAW.name())
                .build();

        try {
            var otpResponse = otpService.verifyOtp(verifyOtpRequest).getResult();
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_SEND_OTP);
        }

        wallet.setBalance(oldBalance.subtract(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.WITHDRAW.name())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());

        withdrawal.setStatus(WithdrawalStatus.PENDING.name());
        withdrawalRepository.save(withdrawal);

        return withdrawalMapper.toWithdrawalResponse(withdrawal);
    }

    public PageResponse<WithdrawalResponse> getMyWithdrawal(Pageable pageable) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = withdrawalRepository.findAllByUserIdAndStatusNot(userId, WithdrawalStatus.PENDING_OTP.name(), pageRequest);

        return PageResponse.fromPage(pageData.map(withdrawalMapper::toWithdrawalResponse));
    }

    public PageResponse<WithdrawalResponse> getWithdrawals(Pageable pageable) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = withdrawalRepository.findAllByStatusNot(WithdrawalStatus.PENDING_OTP.name(), pageRequest);

        return PageResponse.fromPage(pageData.map(withdrawalMapper::toWithdrawalResponse));
    }

    public WithdrawalResponse approveWithdraw(String withdrawalId) {
        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.WITHDRAWAL_NOT_EXISTED));

        if (!withdrawal.getStatus().equals(WithdrawalStatus.PENDING.name()))
            throw new AppException(ErrorCode.INVALID_WITHDRAWAL);

        withdrawal.setStatus(WithdrawalStatus.APPROVED.name());
        withdrawalRepository.save(withdrawal);

        return withdrawalMapper.toWithdrawalResponse(withdrawal);
    }

    @Transactional
    public WithdrawalResponse rejectWithdraw(String withdrawalId) {
        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.WITHDRAWAL_NOT_EXISTED));

        if (!withdrawal.getStatus().equals(WithdrawalStatus.PENDING.name()))
            throw new AppException(ErrorCode.INVALID_WITHDRAWAL);

        String userId = withdrawal.getUserId();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        BigDecimal amount = withdrawal.getAmount();

        wallet.setBalance(oldBalance.add(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.REFUND.name())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());

        withdrawal.setStatus(WithdrawalStatus.REJECTED.name());
        withdrawalRepository.save(withdrawal);

        return withdrawalMapper.toWithdrawalResponse(withdrawal);
    }

    public TransferResponse createTransfer(TransferRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getAmount().compareTo(wallet.getBalance()) > 0)
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

        var toUser = identityService.getUserByUsername(request.getToUsername()).getResult();

        if (toUser.getId().equals(userId))
            throw new AppException(ErrorCode.INVALID_RECIPIENT);

        walletRepository.findByUserId(toUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        transferRepository.findByFromUserId(userId).ifPresent(transferRepository::delete);

        Transfer transfer = transferMapper.toTransfer(request);
        transfer.setFromUserId(userId);
        transfer.setToUserId(toUser.getId());

        transfer = transferRepository.save(transfer);

        return transferMapper.toTransferResponse(transfer);
    }

    public void sendTransferOtp() {
        var userResponse = identityService.getMyInfo().getResult();

        OtpCreationRequest otpCreationRequest = OtpCreationRequest.builder()
                .recipient(userResponse.getEmail())
                .otpType(OtpType.TRANSFER.name())
                .build();

        try {
            var otpResponse = otpService.createOtp(otpCreationRequest).getResult();
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_SEND_OTP);
        }
    }

    @Transactional
    public void verifyTransfer(VerifyTransferRequest request) {
        Transfer transfer = transferRepository.findById(request.getTransferId())
                .orElseThrow(() -> new AppException(ErrorCode.TRANSFER_NOT_EXISTED));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        BigDecimal amount = transfer.getAmount();

        if (amount.compareTo(oldBalance) > 0)
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

        var userResponse = identityService.getMyInfo().getResult();

        VerifyOtpRequest verifyOtpRequest = VerifyOtpRequest.builder()
                .otpCode(request.getOtpCode())
                .recipient(userResponse.getEmail())
                .otpType(OtpType.TRANSFER.name())
                .build();

        try {
            var otpResponse = otpService.verifyOtp(verifyOtpRequest).getResult();
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_SEND_OTP);
        }

        wallet.setBalance(oldBalance.subtract(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.TRANSFER_OUT.name())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());

        Wallet toWallet = walletRepository.findByUserId(transfer.getToUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldToBalance = toWallet.getBalance();
        toWallet.setBalance(oldToBalance.add(amount));
        walletRepository.save(toWallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(transfer.getToUserId())
                .type(TransactionType.TRANSFER_IN.name())
                .amount(amount)
                .balanceBefore(oldToBalance)
                .balanceAfter(toWallet.getBalance())
                .build());

        transferRepository.delete(transfer);
    }

    public void buyCoin(TradeRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        BigDecimal amount = request.getAmount();

        if (amount.compareTo(oldBalance) > 0)
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

        wallet.setBalance(oldBalance.subtract(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.TRADE_BUY.name() + " " + request.getName())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());
    }

    public void sellCoin(TradeRequest request){
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal oldBalance = wallet.getBalance();
        BigDecimal amount = request.getAmount();

        wallet.setBalance(oldBalance.add(amount));
        walletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.TRADE_SELL.name() + " " + request.getName())
                .amount(amount)
                .balanceBefore(oldBalance)
                .balanceAfter(wallet.getBalance())
                .build());
    }

    @Transactional
    public void deleteWalletByUserId(String userId) {
        walletRepository.deleteByUserId(userId);
    }
}

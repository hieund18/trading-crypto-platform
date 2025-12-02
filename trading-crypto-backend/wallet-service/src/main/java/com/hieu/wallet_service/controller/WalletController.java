package com.hieu.wallet_service.controller;

import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.PageResponse;
import com.hieu.wallet_service.dto.request.*;
import com.hieu.wallet_service.dto.response.TransferResponse;
import com.hieu.wallet_service.dto.response.WalletResponse;
import com.hieu.wallet_service.dto.response.WalletTransactionResponse;
import com.hieu.wallet_service.dto.response.WithdrawalResponse;
import com.hieu.wallet_service.service.WalletService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WalletController {
    WalletService walletService;

    @GetMapping("/my-wallet")
    ApiResponse<WalletResponse> getMyWallet() {
        return ApiResponse.<WalletResponse>builder()
                .result(walletService.getMyWallet())
                .build();
    }

    @GetMapping("/my-wallet-transaction")
    ApiResponse<PageResponse<WalletTransactionResponse>> getMyWalletTransaction(
            @RequestParam(required = false) String type,
            @PageableDefault(page = 1, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<WalletTransactionResponse>>builder()
                .result(walletService.getMyWalletTransaction(type, pageable))
                .build();
    }

    @PostMapping("/deposit")
    ApiResponse<WalletResponse> deposit(@RequestBody @Valid DepositRequest request) {
        return ApiResponse.<WalletResponse>builder()
                .result(walletService.deposit(request))
                .build();
    }

    @PostMapping("/withdraw")
    ApiResponse<WithdrawalResponse> createWithdraw(@RequestBody @Valid WithdrawalCreationRequest request) {
        return ApiResponse.<WithdrawalResponse>builder()
                .result(walletService.createWithdraw(request))
                .build();
    }

    @PostMapping("/withdraw/send-otp")
    ApiResponse<Void> sendWithdrawOtp() {
        walletService.sendWithdrawOtp();

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/withdraw/verify-otp")
    ApiResponse<WithdrawalResponse> verifyWithdraw(@RequestBody VerifyWithdrawRequest request) {
        return ApiResponse.<WithdrawalResponse>builder()
                .result(walletService.verifyWithdraw(request))
                .build();
    }

    @GetMapping("/withdraw/my-withdrawal")
    ApiResponse<PageResponse<WithdrawalResponse>> getMyWithdrawal(
            @PageableDefault(page = 1, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<WithdrawalResponse>>builder()
                .result(walletService.getMyWithdrawal(pageable))
                .build();
    }

    @GetMapping("/withdraw")
    ApiResponse<PageResponse<WithdrawalResponse>> getWithdrawals(
            @PageableDefault(page = 1, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<WithdrawalResponse>>builder()
                .result(walletService.getWithdrawals(pageable))
                .build();
    }

    @PutMapping("/withdraw/approve/{withdrawalId}")
    ApiResponse<WithdrawalResponse> approveWithdraw(@PathVariable String withdrawalId) {
        return ApiResponse.<WithdrawalResponse>builder()
                .result(walletService.approveWithdraw(withdrawalId))
                .build();
    }

    @PutMapping("/withdraw/reject/{withdrawalId}")
    ApiResponse<WithdrawalResponse> rejectWithdraw(@PathVariable String withdrawalId) {
        return ApiResponse.<WithdrawalResponse>builder()
                .result(walletService.rejectWithdraw(withdrawalId))
                .build();
    }

    @PostMapping("/transfer")
    ApiResponse<TransferResponse> createTransfer(@RequestBody @Valid TransferRequest request) {
        return ApiResponse.<TransferResponse>builder()
                .result(walletService.createTransfer(request))
                .build();
    }

    @PostMapping("/transfer/send-otp")
    ApiResponse<Void> sendTransferOtp(){
        walletService.sendTransferOtp();

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/transfer/verify-otp")
    ApiResponse<Void> verifyTransfer(@RequestBody @Valid VerifyTransferRequest request){
        walletService.verifyTransfer(request);

        return ApiResponse.<Void>builder().build();
    }
}

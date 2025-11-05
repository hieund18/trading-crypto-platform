package com.hieu.wallet_service.controller;

import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.request.WalletCreationRequest;
import com.hieu.wallet_service.dto.response.WalletResponse;
import com.hieu.wallet_service.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/wallets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InternalWalletController {
    WalletService walletService;

    @PostMapping
    ApiResponse<WalletResponse> createWallet(@RequestBody WalletCreationRequest request){
        return ApiResponse.<WalletResponse>builder()
                .result(walletService.createWallet(request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Void> deleteWalletByUserId(@PathVariable String userId){
        walletService.deleteWalletByUserId(userId);

        return ApiResponse.<Void>builder().build();
    }
}

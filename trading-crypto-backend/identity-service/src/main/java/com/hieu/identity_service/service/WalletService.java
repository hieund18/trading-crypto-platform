package com.hieu.identity_service.service;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.WalletCreationRequest;
import com.hieu.identity_service.dto.response.WalletResponse;
import com.hieu.identity_service.repository.httpclient.WalletClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WalletService {
    WalletClient walletClient;

    public ApiResponse<WalletResponse> createWallet(WalletCreationRequest request) {
        log.info("Calling create wallet");
        return walletClient.createWallet(request);
    }

    public ApiResponse<Void> deleteWalletByUserId(String userId) {
        log.info("Calling delete wallet");
        return walletClient.deleteWalletByUserId(userId);
    }
}

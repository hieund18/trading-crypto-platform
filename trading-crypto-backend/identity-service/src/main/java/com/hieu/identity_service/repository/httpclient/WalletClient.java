package com.hieu.identity_service.repository.httpclient;

import com.hieu.identity_service.configuration.CustomFeignErrorDecoder;
import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.OtpCreationRequest;
import com.hieu.identity_service.dto.request.VerifyOtpRequest;
import com.hieu.identity_service.dto.request.WalletCreationRequest;
import com.hieu.identity_service.dto.response.OtpResponse;
import com.hieu.identity_service.dto.response.VerifyOtpResponse;
import com.hieu.identity_service.dto.response.WalletResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "wallet-service", url = "${app.services.wallet}",
        configuration = {CustomFeignErrorDecoder.class})
public interface WalletClient {
    @PostMapping(value = "/internal/wallets", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<WalletResponse> createWallet(@RequestBody WalletCreationRequest request);

    @DeleteMapping(value = "/internal/wallets/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> deleteWalletByUserId(@PathVariable String userId);
}

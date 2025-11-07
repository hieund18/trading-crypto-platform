package com.hieu.order_service.service;

import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.request.TradeRequest;
import com.hieu.order_service.repository.httpclient.WalletClient;
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

    public ApiResponse<Void> buyCoin(TradeRequest request){
        log.info("Calling buy coin");

        return walletClient.buyCoin(request);
    }

    public ApiResponse<Void> sellCoin(TradeRequest request){
        log.info("Calling sell coin");

        return walletClient.sellCoin(request);
    }
}

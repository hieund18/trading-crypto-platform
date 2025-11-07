package com.hieu.order_service.service;

import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.response.CoinResponse;
import com.hieu.order_service.repository.httpclient.CoinClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CoinService {
    CoinClient coinClient;

    public ApiResponse<CoinResponse> getCoin(String coinId){
        log.info("Calling get coin");

        return coinClient.getCoin(coinId);
    }
}

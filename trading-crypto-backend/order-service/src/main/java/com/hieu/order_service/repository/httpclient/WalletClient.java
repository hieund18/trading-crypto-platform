package com.hieu.order_service.repository.httpclient;

import com.hieu.order_service.configuration.AuthenticationRequestInterceptor;
import com.hieu.order_service.configuration.CustomFeignErrorDecoder;
import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.request.TradeRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "wallet-service", url = "${app.services.wallet}",
    configuration = {AuthenticationRequestInterceptor.class})
public interface WalletClient {
    @PostMapping(value = "/trade/buy", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> buyCoin(@RequestBody TradeRequest request);

    @PostMapping(value = "/trade/sell", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> sellCoin(@RequestBody TradeRequest request);
}

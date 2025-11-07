package com.hieu.order_service.repository.httpclient;

import com.hieu.order_service.configuration.CustomFeignErrorDecoder;
import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.response.CoinResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "coin-service", url = "${app.services.coin}",
        configuration = {CustomFeignErrorDecoder.class})
public interface CoinClient {
    @GetMapping(value = "/markets/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<CoinResponse> getCoin(@PathVariable String id);
}

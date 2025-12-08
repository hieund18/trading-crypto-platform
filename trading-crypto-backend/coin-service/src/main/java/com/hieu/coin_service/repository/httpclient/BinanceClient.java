package com.hieu.coin_service.repository.httpclient;

import java.util.List;

import com.hieu.coin_service.dto.response.BinanceExchangeInfoResponse;
import com.hieu.coin_service.dto.response.BinanceSymbolPriceResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "binance-client", url = "${outbound.market.binance.url}")
public interface BinanceClient {
    @GetMapping(value = "/exchangeInfo", produces = MediaType.APPLICATION_JSON_VALUE)
    BinanceExchangeInfoResponse exchangeInfo();

    @GetMapping(value = "/ticker/price", produces = MediaType.APPLICATION_JSON_VALUE)
    BinanceSymbolPriceResponse getPrice(@RequestParam("symbol") String symbol);

    @GetMapping(value = "/klines", produces = MediaType.APPLICATION_JSON_VALUE)
    List<List<Object>> getKlines(
            @RequestParam("symbol") String symbol,
            @RequestParam(value = "interval") String interval,
            @RequestParam(value = "limit", defaultValue = "1000") int limit,
            @RequestParam(value = "startTime", required = false) Long startTime,
            @RequestParam(value = "endTime", required = false) Long endTime);
}

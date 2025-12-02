package com.hieu.coin_service.repository.httpclient;

import com.hieu.coin_service.dto.response.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "coingecko-client", url = "${outbound.market.coingecko.url}")
public interface CoinGeckoClient {
    @GetMapping("/coins/markets")
    List<CoinGeckoMarketDataResponse> getMarketData(@RequestHeader("x-cg-demo-api-key") String apiKey,
                                                    @RequestParam("vs_currency") String vsCurrency,
                                                    @RequestParam("per_page") int perPage,
                                                    @RequestParam("page") int page);

    @GetMapping("/coins/markets")
    List<CoinGeckoMarketDataResponse> getCoinData(@RequestHeader("x-cg-demo-api-key") String apiKey,
                                                  @RequestParam("vs_currency") String vsCurrency,
                                                  @RequestParam("ids") String ids);

    @GetMapping("/coins/{id}/market_chart")
    CoinGeckoMarketChartResponse getMarketChart(@RequestHeader("x-cg-demo-api-key") String apiKey,
                                                @PathVariable("id") String id,
                                                @RequestParam("vs_currency") String vsCurrency,
                                                @RequestParam("days") int days);

    @GetMapping("/search/trending")
    TrendingResponse getTrendingCoin(@RequestHeader("x-cg-demo-api-key") String apiKey);

    @GetMapping("/coins/list")
    List<CoinGeckoMasterResponse> getAllCoins(@RequestHeader("x-cg-demo-api-key") String apiKey);
}

package com.hieu.coin_service.mapper;

import com.hieu.coin_service.dto.request.ConvertAmountRequest;
import com.hieu.coin_service.dto.request.ConvertQuantityRequest;
import com.hieu.coin_service.dto.response.*;
import com.hieu.coin_service.entity.BinanceSymbolMaster;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.entity.CoinGeckoMaster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CoinMapper {

    Coin toCoin(CoinGeckoMarketDataResponse response);

    CoinResponse toCoinResponse(Coin coin);

    void updateCoin(@MappingTarget Coin coin, CoinGeckoMarketDataResponse coinGeckoMarketDataResponse);

    void updateCoinResponse(@MappingTarget CoinResponse coinResponse, CoinGeckoMarketDataResponse coinGeckoMarketDataResponse);

    CoinUpdateResponse toCoinUpdateResponse(Coin coin);

    ConvertResponse toConvertResponse(ConvertAmountRequest request);

    ConvertResponse toConvertResponse(ConvertQuantityRequest request);

    CoinGeckoMaster toCoinGeckoMaster(CoinGeckoMasterResponse response);

    BinanceSymbolMaster toBinanceSymbolMaster(BinanceSymbol binanceSymbol);

    void updateCoinResponse(@MappingTarget CoinResponse coinResponse, TickerResponse tickerResponse);
}

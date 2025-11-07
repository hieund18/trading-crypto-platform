package com.hieu.coin_service.mapper;

import com.hieu.coin_service.dto.request.ConvertAmountRequest;
import com.hieu.coin_service.dto.request.ConvertQuantityRequest;
import com.hieu.coin_service.dto.response.CoinGeckoMarketDataResponse;
import com.hieu.coin_service.dto.response.CoinResponse;
import com.hieu.coin_service.dto.response.CoinUpdateResponse;
import com.hieu.coin_service.dto.response.ConvertResponse;
import com.hieu.coin_service.entity.Coin;
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
}

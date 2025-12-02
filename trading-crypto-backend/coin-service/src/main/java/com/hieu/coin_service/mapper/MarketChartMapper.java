package com.hieu.coin_service.mapper;

import com.hieu.coin_service.dto.response.MarketChartResponse;
import com.hieu.coin_service.entity.MarketChart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MarketChartMapper {
    MarketChartResponse toMarketChartResponse(MarketChart marketChart);
}

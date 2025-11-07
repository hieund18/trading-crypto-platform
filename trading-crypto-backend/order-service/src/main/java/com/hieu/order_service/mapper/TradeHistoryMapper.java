package com.hieu.order_service.mapper;

import com.hieu.order_service.dto.request.TradeAssetRequest;
import com.hieu.order_service.dto.response.TradeHistoryResponse;
import com.hieu.order_service.entity.TradeHistory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TradeHistoryMapper {
    TradeHistory toTradeHistory(TradeAssetRequest request);

    TradeHistoryResponse toTradeHistoryResponse(TradeHistory tradeHistory);
}

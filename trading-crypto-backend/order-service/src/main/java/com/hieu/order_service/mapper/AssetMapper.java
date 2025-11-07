package com.hieu.order_service.mapper;

import com.hieu.order_service.dto.request.TradeAssetRequest;
import com.hieu.order_service.dto.response.AssetCoinResponse;
import com.hieu.order_service.dto.response.AssetResponse;
import com.hieu.order_service.entity.Asset;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    Asset toAsset(TradeAssetRequest request);

    AssetCoinResponse toAssetCoinResponse(Asset asset);
}

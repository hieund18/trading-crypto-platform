package com.hieu.order_service.mapper;

import com.hieu.order_service.dto.request.AssetBuyRequest;
import com.hieu.order_service.dto.response.AssetCoinResponse;
import com.hieu.order_service.dto.response.CoinResponse;
import com.hieu.order_service.entity.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    Asset toAsset(AssetBuyRequest request);

    AssetCoinResponse toAssetCoinResponse(Asset asset);

    void updateAssetCoinResponse(@MappingTarget AssetCoinResponse assetCoinResponse, CoinResponse coinResponse);
}

package com.hieu.wallet_service.mapper;

import com.hieu.wallet_service.dto.request.WalletCreationRequest;
import com.hieu.wallet_service.dto.response.WalletResponse;
import com.hieu.wallet_service.entity.Wallet;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WalletMapper {
    Wallet toWallet(WalletCreationRequest request);

    WalletResponse toWalletResponse(Wallet wallet);
}

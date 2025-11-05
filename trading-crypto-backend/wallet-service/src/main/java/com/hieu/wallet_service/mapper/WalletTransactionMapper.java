package com.hieu.wallet_service.mapper;

import com.hieu.wallet_service.dto.response.WalletTransactionResponse;
import com.hieu.wallet_service.entity.WalletTransaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WalletTransactionMapper{
    WalletTransactionResponse toWalletTransactionResponse(WalletTransaction walletTransaction);
}

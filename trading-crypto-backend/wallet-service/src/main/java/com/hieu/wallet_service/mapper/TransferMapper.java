package com.hieu.wallet_service.mapper;

import com.hieu.wallet_service.dto.request.TransferRequest;
import com.hieu.wallet_service.dto.response.TransferResponse;
import com.hieu.wallet_service.entity.Transfer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransferMapper {
    Transfer toTransfer(TransferRequest request);

    TransferResponse  toTransferResponse(Transfer transfer);
}

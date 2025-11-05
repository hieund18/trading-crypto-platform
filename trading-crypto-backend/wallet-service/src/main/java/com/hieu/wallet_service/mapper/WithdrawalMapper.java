package com.hieu.wallet_service.mapper;

import com.hieu.wallet_service.dto.request.WithdrawalCreationRequest;
import com.hieu.wallet_service.dto.response.WithdrawalResponse;
import com.hieu.wallet_service.entity.Withdrawal;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WithdrawalMapper {
    Withdrawal toWithdrawal(WithdrawalCreationRequest request);

    WithdrawalResponse toWithdrawalResponse(Withdrawal withdrawal);
}

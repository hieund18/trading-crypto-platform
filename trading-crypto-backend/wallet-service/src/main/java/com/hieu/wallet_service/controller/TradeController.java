package com.hieu.wallet_service.controller;

import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.request.TradeRequest;
import com.hieu.wallet_service.dto.request.TransferRequest;
import com.hieu.wallet_service.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trade")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TradeController {
    WalletService walletService;

    @PostMapping("/buy")
    ApiResponse<Void> buyCoin(@RequestBody TradeRequest request){
        walletService.buyCoin(request);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/sell")
    ApiResponse<Void> sellCoin(@RequestBody TradeRequest request){
        walletService.sellCoin(request);

        return ApiResponse.<Void>builder().build();
    }
}

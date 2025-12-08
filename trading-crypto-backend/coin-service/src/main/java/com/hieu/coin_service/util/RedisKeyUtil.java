package com.hieu.coin_service.util;

import org.springframework.data.domain.Pageable;

public class RedisKeyUtil {
    private static final String PREFIX = "coin-service:";

    public static String coinInfo(String coinId) {
        return PREFIX + "coin:info:" + coinId;
    }

    public static String pageCoins(Pageable pageable) {
        return PREFIX + "coin:page:" + pageable.getPageNumber() + ":size:" + pageable.getPageSize() + ":sort:"
                + pageable.getSort();
    }

    public static String trendingCoins() {
        return PREFIX + "coin:trending";
    }

    public static String binanceTicker(String symbol) {
        return PREFIX + "ticker:" + symbol.toUpperCase();
    }

    public static String leaderboard(String type) {
        return PREFIX + "leaderboard:" + type;
    }
}

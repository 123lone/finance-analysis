package com.finance.analytics.dto;

import java.math.BigDecimal;

public record AnomalyResponse(
    TransactionResponse transaction,
    BigDecimal categoryMean,
    BigDecimal categoryStandardDeviation,
    BigDecimal deviationAmount
) {}

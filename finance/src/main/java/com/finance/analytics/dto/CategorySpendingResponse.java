package com.finance.analytics.dto;

import com.finance.analytics.entity.Category;

import java.math.BigDecimal;

public record CategorySpendingResponse(
    Category category,
    BigDecimal totalAmount
) {}

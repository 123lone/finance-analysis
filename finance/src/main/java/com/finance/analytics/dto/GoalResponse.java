package com.finance.analytics.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GoalResponse(
    Long id,
    String title,
    BigDecimal currentAmount,
    BigDecimal targetAmount,
    LocalDateTime createdAt,
    Long userId
) {}

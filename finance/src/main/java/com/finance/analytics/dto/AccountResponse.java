package com.finance.analytics.dto;

import com.finance.analytics.entity.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
    Long id,
    String accountName,
    AccountType accountType,
    BigDecimal currentBalance,
    LocalDateTime createdAt,
    Long userId
) {}

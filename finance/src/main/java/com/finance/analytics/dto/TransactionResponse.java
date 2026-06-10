package com.finance.analytics.dto;

import com.finance.analytics.entity.Category;
import com.finance.analytics.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
    Long id,
    Long accountId,
    BigDecimal amount,
    String merchant,
    String description,
    LocalDateTime transactionDate,
    TransactionType type,
    Category category,
    LocalDateTime createdAt
) {}

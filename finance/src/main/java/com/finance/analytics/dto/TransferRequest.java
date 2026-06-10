package com.finance.analytics.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransferRequest(
    @NotNull(message = "Source account ID is required")
    Long fromAccountId,

    @NotNull(message = "Destination account ID is required")
    Long toAccountId,

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    BigDecimal amount,

    String description,

    @NotNull(message = "Transaction date is required")
    LocalDateTime transactionDate
) {}

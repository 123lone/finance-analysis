package com.finance.analytics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finance.analytics.entity.Category;
import com.finance.analytics.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionRequest(
    @NotNull(message = "Account ID is required")
    @JsonProperty("accountId")
    Long accountId,

    @NotNull(message = "Amount is required")
    @JsonProperty("amount")
    BigDecimal amount,

    @NotBlank(message = "Merchant is required")
    @JsonProperty("merchant")
    String merchant,

    @JsonProperty("description")
    String description,

    @NotNull(message = "Transaction date is required")
    @JsonProperty("transactionDate")
    LocalDateTime transactionDate,

    @NotNull(message = "Type is required")
    @JsonProperty("type")
    TransactionType type,

    @NotNull(message = "Category is required")
    @JsonProperty("category")
    Category category
) {}

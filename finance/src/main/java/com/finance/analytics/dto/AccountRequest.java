package com.finance.analytics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finance.analytics.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AccountRequest(
    @NotBlank(message = "Account name is required")
    @JsonProperty("accountName")
    String accountName,

    @NotNull(message = "Account type is required")
    @JsonProperty("accountType")
    AccountType accountType,

    @NotNull(message = "Current balance is required")
    @JsonProperty("currentBalance")
    BigDecimal currentBalance
) {}

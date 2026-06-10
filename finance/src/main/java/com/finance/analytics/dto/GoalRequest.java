package com.finance.analytics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GoalRequest(
    @NotBlank(message = "Title is required")
    @JsonProperty("title")
    String title,

    @NotNull(message = "Target amount is required")
    @JsonProperty("targetAmount")
    BigDecimal targetAmount,
    
    @JsonProperty("currentAmount")
    BigDecimal currentAmount
) {}

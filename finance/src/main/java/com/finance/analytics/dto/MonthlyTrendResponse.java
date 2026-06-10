package com.finance.analytics.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record MonthlyTrendResponse(
    int month,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal savingsRatePercentage
) {
    public MonthlyTrendResponse(int month, BigDecimal totalIncome, BigDecimal totalExpense) {
        this(month, totalIncome, totalExpense, calculateSavingsRate(totalIncome, totalExpense));
    }

    private static BigDecimal calculateSavingsRate(BigDecimal income, BigDecimal expense) {
        if (income == null || income.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (expense == null) {
            expense = BigDecimal.ZERO;
        }
        
        // (Income - Expense) / Income * 100
        BigDecimal difference = income.subtract(expense);
        return difference.divide(income, 4, RoundingMode.HALF_UP)
                         .multiply(BigDecimal.valueOf(100))
                         .setScale(2, RoundingMode.HALF_UP);
    }
}

package com.finance.analytics.service;

import com.finance.analytics.dto.CategorySpendingResponse;
import com.finance.analytics.dto.MonthlyTrendResponse;
import com.finance.analytics.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    @Cacheable(value = "spendingByCategory", key = "#email + '-' + #range")
    @Transactional(readOnly = true)
    public List<CategorySpendingResponse> getSpendingByCategory(String email, String range) {
        LocalDateTime startDate = LocalDateTime.now();
        if ("week".equalsIgnoreCase(range)) {
            startDate = startDate.minusDays(7);
        } else if ("month".equalsIgnoreCase(range)) {
            startDate = startDate.minusMonths(1);
        } else if ("year".equalsIgnoreCase(range)) {
            startDate = startDate.minusYears(1);
        } else {
            startDate = startDate.minusYears(100); // Default all time if unknown
        }
        return transactionRepository.getSpendingByCategory(email, startDate);
    }

    @Cacheable(value = "monthlyTrend", key = "#email + '-' + #year")
    @Transactional(readOnly = true)
    public List<MonthlyTrendResponse> getMonthlyTrend(String email, int year) {
        return transactionRepository.getMonthlyTrend(email, year);
    }
}

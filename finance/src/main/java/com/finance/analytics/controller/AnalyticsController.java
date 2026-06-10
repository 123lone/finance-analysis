package com.finance.analytics.controller;

import com.finance.analytics.dto.AnomalyResponse;
import com.finance.analytics.dto.CategorySpendingResponse;
import com.finance.analytics.dto.MonthlyTrendResponse;
import com.finance.analytics.entity.User;
import com.finance.analytics.service.AnalyticsService;
import com.finance.analytics.service.AnomalyDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AnomalyDetectionService anomalyDetectionService;

    @GetMapping("/spending-by-category")
    public ResponseEntity<List<CategorySpendingResponse>> getSpendingByCategory(
            @RequestParam(defaultValue = "month") String range,
            @AuthenticationPrincipal User user) {
        List<CategorySpendingResponse> responses = analyticsService.getSpendingByCategory(user.getEmail(), range);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendResponse>> getMonthlyTrend(
            @RequestParam int year,
            @AuthenticationPrincipal User user) {
        List<MonthlyTrendResponse> responses = analyticsService.getMonthlyTrend(user.getEmail(), year);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<AnomalyResponse>> getAnomalies(@AuthenticationPrincipal User user) {
        List<AnomalyResponse> responses = anomalyDetectionService.detectAnomalies(user.getEmail());
        return ResponseEntity.ok(responses);
    }
}

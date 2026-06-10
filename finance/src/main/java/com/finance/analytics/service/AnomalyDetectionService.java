package com.finance.analytics.service;

import com.finance.analytics.dto.AnomalyResponse;
import com.finance.analytics.dto.TransactionResponse;
import com.finance.analytics.entity.Category;
import com.finance.analytics.entity.Transaction;
import com.finance.analytics.entity.TransactionType;
import com.finance.analytics.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnomalyDetectionService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<AnomalyResponse> detectAnomalies(String email) {
        // Fetch all transactions for the user
        List<Transaction> allTransactions = transactionRepository.findByAccountUserEmail(email);

        // Filter out only EXPENSE transactions and group by category
        Map<Category, List<Transaction>> expensesByCategory = allTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(Transaction::getCategory));

        List<AnomalyResponse> anomalies = new ArrayList<>();

        for (Map.Entry<Category, List<Transaction>> entry : expensesByCategory.entrySet()) {
            List<Transaction> categoryTransactions = entry.getValue();

            // We require at least 3 transactions to calculate a meaningful standard deviation
            if (categoryTransactions.size() < 3) {
                continue;
            }

            DescriptiveStatistics stats = new DescriptiveStatistics();
            for (Transaction t : categoryTransactions) {
                stats.addValue(t.getAmount().doubleValue());
            }

            double mean = stats.getMean();
            double stdDev = stats.getStandardDeviation();
            double threshold = mean + (2 * stdDev);

            for (Transaction t : categoryTransactions) {
                double amount = t.getAmount().doubleValue();
                if (amount > threshold) {
                    BigDecimal deviation = BigDecimal.valueOf(amount - mean).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal bdMean = BigDecimal.valueOf(mean).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal bdStdDev = BigDecimal.valueOf(stdDev).setScale(2, RoundingMode.HALF_UP);

                    anomalies.add(new AnomalyResponse(
                            mapToResponse(t),
                            bdMean,
                            bdStdDev,
                            deviation
                    ));
                }
            }
        }

        return anomalies;
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAccount().getId(),
                transaction.getAmount(),
                transaction.getMerchant(),
                transaction.getDescription(),
                transaction.getTransactionDate(),
                transaction.getType(),
                transaction.getCategory(),
                transaction.getCreatedAt()
        );
    }
}

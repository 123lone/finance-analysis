package com.finance.analytics.repository;

import com.finance.analytics.dto.CategorySpendingResponse;
import com.finance.analytics.dto.MonthlyTrendResponse;
import com.finance.analytics.entity.Transaction;
import com.finance.analytics.entity.Category;
import com.finance.analytics.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByAccountId(Long accountId);
    List<Transaction> findByCategory(Category category);
    List<Transaction> findByType(TransactionType type);
    List<Transaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<Transaction> findByAccountUserEmail(String email);
    Optional<Transaction> findByIdAndAccountUserEmail(Long id, String email);

    @Query("SELECT new com.finance.analytics.dto.CategorySpendingResponse(t.category, SUM(t.amount)) " +
           "FROM Transaction t " +
           "WHERE t.account.user.email = :email AND t.type = 'EXPENSE' AND t.transactionDate >= :startDate " +
           "GROUP BY t.category")
    List<CategorySpendingResponse> getSpendingByCategory(@Param("email") String email, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT new com.finance.analytics.dto.MonthlyTrendResponse(" +
           "CAST(EXTRACT(MONTH FROM t.transactionDate) AS int), " +
           "SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), " +
           "SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)) " +
           "FROM Transaction t " +
           "WHERE t.account.user.email = :email AND EXTRACT(YEAR FROM t.transactionDate) = :year " +
           "GROUP BY EXTRACT(MONTH FROM t.transactionDate) " +
           "ORDER BY EXTRACT(MONTH FROM t.transactionDate)")
    List<MonthlyTrendResponse> getMonthlyTrend(@Param("email") String email, @Param("year") int year);
}

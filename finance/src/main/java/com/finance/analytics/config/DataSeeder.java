package com.finance.analytics.config;

import com.finance.analytics.entity.*;
import com.finance.analytics.repository.AccountRepository;
import com.finance.analytics.repository.GoalRepository;
import com.finance.analytics.repository.TransactionRepository;
import com.finance.analytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String demoEmail = "demo@example.com";
        
        if (userRepository.findByEmail(demoEmail).isPresent()) {
            log.info("Demo user already exists. Skipping data seeding.");
            return;
        }

        log.info("Seeding robust mock data for Demo User...");

        // 1. Create Demo User
        User demoUser = User.builder()
                .name("Demo User")
                .email(demoEmail)
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .build();
        userRepository.save(demoUser);

        // 2. Create Mock Bank Accounts
        Account checking = Account.builder()
                .user(demoUser)
                .accountName("Main Checking")
                .accountType(AccountType.CHECKING)
                .currentBalance(new BigDecimal("4250.00"))
                .build();
        Account savings = Account.builder()
                .user(demoUser)
                .accountName("High-Yield Savings")
                .accountType(AccountType.SAVINGS)
                .currentBalance(new BigDecimal("15000.00"))
                .build();
        accountRepository.save(checking);
        accountRepository.save(savings);

        // 3. Create Goals
        Goal vacation = Goal.builder()
                .user(demoUser)
                .title("Japan Trip")
                .targetAmount(new BigDecimal("5000.00"))
                .currentAmount(new BigDecimal("3200.00")) // Partially complete
                .build();
        Goal emergency = Goal.builder()
                .user(demoUser)
                .title("Emergency Fund")
                .targetAmount(new BigDecimal("10000.00"))
                .currentAmount(new BigDecimal("10000.00")) // Completed
                .build();
        Goal car = Goal.builder()
                .user(demoUser)
                .title("New Car Down Payment")
                .targetAmount(new BigDecimal("8000.00"))
                .currentAmount(new BigDecimal("1500.00")) // Barely started
                .build();
        goalRepository.save(vacation);
        goalRepository.save(emergency);
        goalRepository.save(car);

        // 4. Generate 6 Months of Transactions
        List<Transaction> transactions = new ArrayList<>();
        Random rand = new Random();
        LocalDateTime now = LocalDateTime.now();

        // Monthly Salary
        for (int i = 0; i < 6; i++) {
            transactions.add(Transaction.builder()
                    .account(checking)
                    .amount(new BigDecimal("4500.00"))
                    .merchant("Tech Corp Inc.")
                    .description("Monthly Salary")
                    .transactionDate(now.minusMonths(i).withDayOfMonth(1))
                    .type(TransactionType.INCOME)
                    .category(Category.SALARY)
                    .build());
            
            // Monthly Rent
            transactions.add(Transaction.builder()
                    .account(checking)
                    .amount(new BigDecimal("1800.00"))
                    .merchant("City Apartments")
                    .description("Monthly Rent")
                    .transactionDate(now.minusMonths(i).withDayOfMonth(3))
                    .type(TransactionType.EXPENSE)
                    .category(Category.RENT)
                    .build());

            // Monthly Utilities
            transactions.add(Transaction.builder()
                    .account(checking)
                    .amount(new BigDecimal(100 + rand.nextInt(50) + ".00"))
                    .merchant("City Power & Light")
                    .description("Electricity & Water")
                    .transactionDate(now.minusMonths(i).withDayOfMonth(10))
                    .type(TransactionType.EXPENSE)
                    .category(Category.UTILITIES)
                    .build());
        }

        // Weekly Groceries & Daily Coffee
        for (int i = 0; i < 180; i++) { // Past 180 days
            LocalDateTime date = now.minusDays(i);
            
            // Coffee every other day
            if (i % 2 == 0) {
                transactions.add(Transaction.builder()
                        .account(checking)
                        .amount(new BigDecimal(4 + rand.nextInt(3) + "." + rand.nextInt(99)))
                        .merchant("Starbucks")
                        .description("Morning Coffee")
                        .transactionDate(date)
                        .type(TransactionType.EXPENSE)
                        .category(Category.FOOD)
                        .build());
            }

            // Groceries every 7 days
            if (i % 7 == 0) {
                transactions.add(Transaction.builder()
                        .account(checking)
                        .amount(new BigDecimal(80 + rand.nextInt(70) + ".00"))
                        .merchant("Whole Foods")
                        .description("Weekly Groceries")
                        .transactionDate(date)
                        .type(TransactionType.EXPENSE)
                        .category(Category.FOOD)
                        .build());
            }
            
            // Random Shopping
            if (i % 15 == 0) {
                transactions.add(Transaction.builder()
                        .account(checking)
                        .amount(new BigDecimal(40 + rand.nextInt(150) + ".00"))
                        .merchant("Amazon")
                        .description("Online Shopping")
                        .transactionDate(date)
                        .type(TransactionType.EXPENSE)
                        .category(Category.SHOPPING)
                        .build());
            }
        }

        // Annual Expenses (e.g., Insurance)
        transactions.add(Transaction.builder()
                .account(checking)
                .amount(new BigDecimal("1200.00"))
                .merchant("Geico")
                .description("Annual Car Insurance")
                .transactionDate(now.minusMonths(2))
                .type(TransactionType.EXPENSE)
                .category(Category.OTHER)
                .build());

        transactionRepository.saveAll(transactions);
        log.info("Successfully seeded robust mock data!");
    }
}

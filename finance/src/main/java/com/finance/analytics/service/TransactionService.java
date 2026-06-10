package com.finance.analytics.service;

import com.finance.analytics.dto.TransactionRequest;
import com.finance.analytics.dto.TransactionResponse;
import com.finance.analytics.dto.TransferRequest;
import com.finance.analytics.entity.Account;
import com.finance.analytics.entity.Transaction;
import com.finance.analytics.entity.TransactionType;
import com.finance.analytics.entity.Category;
import com.finance.analytics.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import com.finance.analytics.repository.AccountRepository;
import com.finance.analytics.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.finance.analytics.kafka.TransactionEventProducer;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionEventProducer transactionEventProducer;

    @Caching(evict = {
            @CacheEvict(value = "spendingByCategory", allEntries = true),
            @CacheEvict(value = "monthlyTrend", allEntries = true)
    })
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String email) {
        Account account = accountRepository.findByIdAndUserEmail(request.accountId(), email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found or access denied"));

        applyTransactionToAccount(account, request.type(), request.amount());

        Transaction transaction = Transaction.builder()
                .account(account)
                .amount(request.amount())
                .merchant(request.merchant())
                .description(request.description())
                .transactionDate(request.transactionDate())
                .type(request.type())
                .category(request.category())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        accountRepository.save(account);
        
        try {
            transactionEventProducer.publishTransactionCreated(savedTransaction);
        } catch (Exception e) {
            log.error("Failed to publish transaction event to Kafka for transaction ID: {}", savedTransaction.getId(), e);
        }
        
        return mapToResponse(savedTransaction);
    }

    @Caching(evict = {
            @CacheEvict(value = "spendingByCategory", allEntries = true),
            @CacheEvict(value = "monthlyTrend", allEntries = true)
    })
    @Transactional
    public List<TransactionResponse> transferFunds(TransferRequest request, String email) {
        if (request.fromAccountId().equals(request.toAccountId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        Account fromAccount = accountRepository.findByIdAndUserEmail(request.fromAccountId(), email)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found or access denied"));
        
        Account toAccount = accountRepository.findByIdAndUserEmail(request.toAccountId(), email)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found or access denied"));

        if (fromAccount.getCurrentBalance().compareTo(request.amount()) < 0) {
            throw new IllegalArgumentException("Insufficient funds in source account");
        }

        // Deduct from source
        fromAccount.setCurrentBalance(fromAccount.getCurrentBalance().subtract(request.amount()));
        // Add to destination
        toAccount.setCurrentBalance(toAccount.getCurrentBalance().add(request.amount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        String description = request.description() != null && !request.description().isBlank() 
            ? request.description() 
            : "Transfer from " + fromAccount.getAccountName() + " to " + toAccount.getAccountName();

        // Create debit transaction
        Transaction debitTransaction = Transaction.builder()
                .account(fromAccount)
                .amount(request.amount())
                .merchant(toAccount.getAccountName())
                .description(description)
                .transactionDate(request.transactionDate())
                .type(TransactionType.TRANSFER)
                .category(Category.OTHER)
                .build();

        // Create credit transaction
        Transaction creditTransaction = Transaction.builder()
                .account(toAccount)
                .amount(request.amount())
                .merchant(fromAccount.getAccountName())
                .description(description)
                .transactionDate(request.transactionDate())
                .type(TransactionType.TRANSFER)
                .category(Category.OTHER)
                .build();

        Transaction savedDebit = transactionRepository.save(debitTransaction);
        Transaction savedCredit = transactionRepository.save(creditTransaction);

        try {
            transactionEventProducer.publishTransactionCreated(savedDebit);
            transactionEventProducer.publishTransactionCreated(savedCredit);
        } catch (Exception e) {
            log.error("Failed to publish transfer events to Kafka", e);
        }

        return List.of(mapToResponse(savedDebit), mapToResponse(savedCredit));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(String email) {
        return transactionRepository.findByAccountUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id, String email) {
        Transaction transaction = getTransactionEntity(id, email);
        return mapToResponse(transaction);
    }

    @Caching(evict = {
            @CacheEvict(value = "spendingByCategory", allEntries = true),
            @CacheEvict(value = "monthlyTrend", allEntries = true)
    })
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, String email) {
        Transaction transaction = getTransactionEntity(id, email);
        
        if (!transaction.getAccount().getId().equals(request.accountId())) {
            // Revert from old account
            revertTransactionFromAccount(transaction.getAccount(), transaction.getType(), transaction.getAmount());
            accountRepository.save(transaction.getAccount());

            // Apply to new account
            Account newAccount = accountRepository.findByIdAndUserEmail(request.accountId(), email)
                    .orElseThrow(() -> new ResourceNotFoundException("New Account not found or access denied"));
            
            applyTransactionToAccount(newAccount, request.type(), request.amount());
            accountRepository.save(newAccount);
            transaction.setAccount(newAccount);
        } else {
            // Same account: revert old amount and type, apply new
            revertTransactionFromAccount(transaction.getAccount(), transaction.getType(), transaction.getAmount());
            applyTransactionToAccount(transaction.getAccount(), request.type(), request.amount());
            accountRepository.save(transaction.getAccount());
        }

        transaction.setAmount(request.amount());
        transaction.setMerchant(request.merchant());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setType(request.type());
        transaction.setCategory(request.category());

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return mapToResponse(updatedTransaction);
    }

    @Caching(evict = {
            @CacheEvict(value = "spendingByCategory", allEntries = true),
            @CacheEvict(value = "monthlyTrend", allEntries = true)
    })
    @Transactional
    public void deleteTransaction(Long id, String email) {
        Transaction transaction = getTransactionEntity(id, email);
        
        revertTransactionFromAccount(transaction.getAccount(), transaction.getType(), transaction.getAmount());
        accountRepository.save(transaction.getAccount());
        
        transactionRepository.delete(transaction);
    }

    private void applyTransactionToAccount(Account account, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            account.setCurrentBalance(account.getCurrentBalance().add(amount));
        } else if (type == TransactionType.EXPENSE) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(amount));
        }
    }

    private void revertTransactionFromAccount(Account account, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(amount));
        } else if (type == TransactionType.EXPENSE) {
            account.setCurrentBalance(account.getCurrentBalance().add(amount));
        }
    }

    private Transaction getTransactionEntity(Long id, String email) {
        return transactionRepository.findByIdAndAccountUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found or access denied"));
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

    @Transactional(readOnly = true)
    public String exportTransactions(String email) {
        List<Transaction> transactions = transactionRepository.findByAccountUserEmail(email);
        StringBuilder csvBuilder = new StringBuilder();
        
        // CSV Header
        csvBuilder.append("Date,Account,Type,Category,Merchant,Description,Amount\n");
        
        // CSV Rows
        for (Transaction t : transactions) {
            csvBuilder.append(t.getTransactionDate() != null ? t.getTransactionDate().toString() : "").append(",");
            csvBuilder.append(escapeCsv(t.getAccount().getAccountName())).append(",");
            csvBuilder.append(t.getType() != null ? t.getType().name() : "").append(",");
            csvBuilder.append(t.getCategory() != null ? t.getCategory().name() : "").append(",");
            csvBuilder.append(escapeCsv(t.getMerchant())).append(",");
            csvBuilder.append(escapeCsv(t.getDescription())).append(",");
            csvBuilder.append(t.getAmount() != null ? t.getAmount().toString() : "0.00").append("\n");
        }
        
        return csvBuilder.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}

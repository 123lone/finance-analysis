package com.finance.analytics.service;

import com.finance.analytics.dto.AccountRequest;
import com.finance.analytics.dto.AccountResponse;
import com.finance.analytics.entity.Account;
import com.finance.analytics.entity.User;
import com.finance.analytics.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse createAccount(AccountRequest request, User user) {
        Account account = Account.builder()
                .accountName(request.accountName())
                .accountType(request.accountType())
                .currentBalance(request.currentBalance())
                .user(user)
                .build();

        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(String email) {
        return accountRepository.findByUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id, String email) {
        Account account = accountRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new RuntimeException("Account not found or access denied"));
        return mapToResponse(account);
    }

    private AccountResponse mapToResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountName(),
                account.getAccountType(),
                account.getCurrentBalance(),
                account.getCreatedAt(),
                account.getUser().getId()
        );
    }
}

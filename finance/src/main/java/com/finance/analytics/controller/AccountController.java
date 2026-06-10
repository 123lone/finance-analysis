package com.finance.analytics.controller;

import com.finance.analytics.dto.AccountRequest;
import com.finance.analytics.dto.AccountResponse;
import com.finance.analytics.entity.User;
import com.finance.analytics.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal User user) {
        AccountResponse response = accountService.createAccount(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getUserAccounts(@AuthenticationPrincipal User user) {
        List<AccountResponse> responses = accountService.getUserAccounts(user.getEmail());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        AccountResponse response = accountService.getAccountById(id, user.getEmail());
        return ResponseEntity.ok(response);
    }
}

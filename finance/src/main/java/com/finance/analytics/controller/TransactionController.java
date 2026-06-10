package com.finance.analytics.controller;

import com.finance.analytics.dto.TransactionRequest;
import com.finance.analytics.dto.TransactionResponse;
import com.finance.analytics.dto.TransferRequest;
import com.finance.analytics.entity.User;
import com.finance.analytics.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User user) {
        TransactionResponse response = transactionService.createTransaction(request, user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/transfer")
    public ResponseEntity<List<TransactionResponse>> transferFunds(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal User user) {
        List<TransactionResponse> responses = transactionService.transferFunds(request, user.getEmail());
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(@AuthenticationPrincipal User user) {
        List<TransactionResponse> responses = transactionService.getUserTransactions(user.getEmail());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        TransactionResponse response = transactionService.getTransactionById(id, user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User user) {
        TransactionResponse response = transactionService.updateTransaction(id, request, user.getEmail());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(id, user.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTransactions(@AuthenticationPrincipal User user) {
        String csvData = transactionService.exportTransactions(user.getEmail());
        byte[] output = csvData.getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "transactions.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(output);
    }
}

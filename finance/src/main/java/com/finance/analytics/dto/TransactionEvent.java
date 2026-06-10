package com.finance.analytics.dto;

import com.finance.analytics.entity.Category;
import com.finance.analytics.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent implements Serializable {

    private Long transactionId;
    private Long accountId;
    private BigDecimal amount;
    private Category category;
    private TransactionType transactionType;
    private LocalDateTime timestamp;

}

package com.finance.analytics.kafka;

import com.finance.analytics.dto.TransactionEvent;
import com.finance.analytics.entity.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTransactionCreated(Transaction transaction) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(transaction.getId())
                .accountId(transaction.getAccount().getId())
                .amount(transaction.getAmount())
                .category(transaction.getCategory())
                .transactionType(transaction.getType())
                .timestamp(transaction.getTransactionDate())
                .build();

        log.info("Publishing TransactionCreated event to Kafka topic [transactions-topic]: {}", event);
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                kafkaTemplate.send("transactions-topic", event.getTransactionId().toString(), event);
            } catch (Exception e) {
                log.error("Failed to publish transaction event asynchronously", e);
            }
        });
    }
}

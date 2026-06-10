package com.finance.analytics.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.analytics.dto.TransactionEvent;
import com.finance.analytics.entity.TransactionAudit;
import com.finance.analytics.repository.TransactionAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final TransactionAuditRepository auditRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "transactions-topic", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeTransaction(TransactionEvent event) {
        log.info("Received new transaction event from Kafka for Transaction ID [{}], Account ID [{}]", 
                 event.getTransactionId(), event.getAccountId());

        try {
            // 1. Log transaction details
            log.debug("Full Event Details: {}", event);

            // 2. Store audit information
            TransactionAudit audit = TransactionAudit.builder()
                    .transactionId(event.getTransactionId())
                    .eventType("TRANSACTION_CREATED")
                    .processedAt(LocalDateTime.now())
                    .rawPayload(objectMapper.writeValueAsString(event))
                    .build();
            auditRepository.save(audit);
            log.info("Successfully saved audit log for Transaction ID [{}]", event.getTransactionId());

            // 3. Prepare event for future analytics processing
            // For example, routing to an analytics topic, updating elasticsearch, or caching real-time dashboards
            processForAnalytics(event);

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize TransactionEvent payload for audit logging", e);
        } catch (Exception e) {
            log.error("Error processing transaction event", e);
        }
    }

    private void processForAnalytics(TransactionEvent event) {
        // Placeholder for future analytics engine logic (e.g., Apache Spark streaming trigger)
        log.info("Event {} queued for downstream real-time analytics engine.", event.getTransactionId());
    }
}

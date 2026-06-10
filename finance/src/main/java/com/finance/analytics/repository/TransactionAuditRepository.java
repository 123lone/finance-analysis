package com.finance.analytics.repository;

import com.finance.analytics.entity.TransactionAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionAuditRepository extends JpaRepository<TransactionAudit, Long> {
}

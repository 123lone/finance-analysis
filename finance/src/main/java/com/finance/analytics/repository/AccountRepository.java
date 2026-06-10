package com.finance.analytics.repository;

import com.finance.analytics.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserEmail(String email);
    Optional<Account> findByIdAndUserEmail(Long id, String email);
}

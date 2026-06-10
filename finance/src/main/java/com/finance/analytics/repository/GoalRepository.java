package com.finance.analytics.repository;

import com.finance.analytics.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserEmail(String email);
    Optional<Goal> findByIdAndUserEmail(Long id, String email);
}

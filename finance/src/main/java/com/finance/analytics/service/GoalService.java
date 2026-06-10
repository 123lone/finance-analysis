package com.finance.analytics.service;

import com.finance.analytics.dto.GoalRequest;
import com.finance.analytics.dto.GoalResponse;
import com.finance.analytics.entity.Goal;
import com.finance.analytics.entity.User;
import com.finance.analytics.exception.ResourceNotFoundException;
import com.finance.analytics.repository.GoalRepository;
import com.finance.analytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Transactional
    public GoalResponse createGoal(GoalRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Goal goal = Goal.builder()
                .user(user)
                .title(request.title())
                .currentAmount(request.currentAmount() != null ? request.currentAmount() : BigDecimal.ZERO)
                .targetAmount(request.targetAmount())
                .build();

        Goal savedGoal = goalRepository.save(goal);
        return mapToResponse(savedGoal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getUserGoals(String userEmail) {
        return goalRepository.findByUserEmail(userEmail).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request, String userEmail) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        
        goal.setTitle(request.title());
        goal.setTargetAmount(request.targetAmount());
        if (request.currentAmount() != null) {
            goal.setCurrentAmount(request.currentAmount());
        }
        
        Goal updatedGoal = goalRepository.save(goal);
        return mapToResponse(updatedGoal);
    }

    @Transactional
    public void deleteGoal(Long id, String userEmail) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalResponse mapToResponse(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getCurrentAmount(),
                goal.getTargetAmount(),
                goal.getCreatedAt(),
                goal.getUser().getId()
        );
    }
}

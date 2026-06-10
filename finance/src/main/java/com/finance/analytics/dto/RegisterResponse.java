package com.finance.analytics.dto;

import com.finance.analytics.entity.Role;

public record RegisterResponse(
    Long id,
    String name,
    String email,
    Role role
) {}

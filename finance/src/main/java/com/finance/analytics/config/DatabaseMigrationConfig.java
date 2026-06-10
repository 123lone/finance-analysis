package com.finance.analytics.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseMigrationConfig {

    @Bean
    public CommandLineRunner migrateDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            log.info("Running database migrations...");
            try {
                jdbcTemplate.execute("ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_check");
                log.info("Successfully dropped outdated transactions_category_check constraint.");
            } catch (Exception e) {
                log.warn("Failed to drop constraint. It might not exist.", e);
            }
        };
    }
}

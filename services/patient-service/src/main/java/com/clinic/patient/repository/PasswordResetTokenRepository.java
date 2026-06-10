package com.clinic.patient.repository;

import com.clinic.patient.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByEmailOrderByExpiresAtDesc(String email);
    void deleteByEmail(String email);
}

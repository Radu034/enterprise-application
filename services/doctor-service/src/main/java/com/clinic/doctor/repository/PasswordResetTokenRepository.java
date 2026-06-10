package com.clinic.doctor.repository;

import com.clinic.doctor.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByEmailOrderByExpiresAtDesc(String email);
    void deleteByEmail(String email);
}

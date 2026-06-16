package com.clinic.patient.controller;

import com.clinic.patient.dto.LoginRequest;
import com.clinic.patient.dto.PatientResponse;
import com.clinic.patient.dto.RegisterRequest;
import com.clinic.patient.entity.PasswordResetToken;
import com.clinic.patient.entity.Patient;
import com.clinic.patient.repository.PasswordResetTokenRepository;
import com.clinic.patient.repository.PatientRepository;
import com.clinic.patient.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PatientRepository repository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(PatientRepository repository,
                          PasswordResetTokenRepository tokenRepository,
                          EmailService emailService) {
        this.repository = repository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<PatientResponse> register(@RequestBody RegisterRequest req) {
        if (repository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Patient patient = new Patient();
        patient.setFirstName(req.firstName);
        patient.setLastName(req.lastName);
        patient.setEmail(req.email);
        patient.setPassword(encoder.encode(req.password));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(repository.save(patient)));
    }

    @PostMapping("/login")
    public ResponseEntity<PatientResponse> login(@RequestBody LoginRequest req) {
        return repository.findByEmail(req.email)
                .filter(p -> encoder.matches(req.password, p.getPassword()))
                .map(p -> ResponseEntity.ok(mapToResponse(p)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // ── Forgot password: generate & email a 6-digit code ──────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        // Always return 200 so we don't reveal whether an email exists
        if (repository.findByEmail(email).isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If that email exists, a code was sent."));
        }

        // Delete any previous unused tokens for this email
        tokenRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        token.setUsed(false);
        tokenRepository.save(token);

        try {
            emailService.sendResetCode(email, code);
        } catch (Exception e) {
            // If email sending fails (e.g. no SMTP configured), log it but
            // don't expose the code in the response in production.
            System.err.println("[WARN] Could not send reset email: " + e.getMessage());
            System.out.println("[DEV]  Reset code for " + email + " → " + code);
        }

        return ResponseEntity.ok(Map.of("message", "If that email exists, a code was sent."));
    }

    // ── Reset password: validate code + set new password ──────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String email   = body.get("email");
        String code    = body.get("code");
        String newPass = body.get("newPassword");

        if (email == null || code == null || newPass == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        PasswordResetToken token = tokenRepository
                .findTopByEmailOrderByExpiresAtDesc(email)
                .orElse(null);

        if (token == null || token.isUsed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired code"));
        }
        if (!token.getCode().equals(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Incorrect code"));
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Code has expired"));
        }

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        // Update password
        Patient patient = repository.findByEmail(email).orElseThrow();
        patient.setPassword(encoder.encode(newPass));
        repository.save(patient);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    private PatientResponse mapToResponse(Patient p) {
        PatientResponse res = new PatientResponse();
        res.id = p.getId();
        res.firstName = p.getFirstName();
        res.lastName = p.getLastName();
        res.email = p.getEmail();
        res.phone = p.getPhone();
        res.birthDate = p.getBirthDate();
        res.address = p.getAddress();
        res.bloodType = p.getBloodType();
        res.emergencyContact = p.getEmergencyContact();
        return res;
    }
}

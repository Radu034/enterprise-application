package com.clinic.doctor.controller;

import com.clinic.doctor.dto.DoctorResponse;
import com.clinic.doctor.dto.LoginRequest;
import com.clinic.doctor.dto.RegisterRequest;
import com.clinic.doctor.entity.Doctor;
import com.clinic.doctor.entity.PasswordResetToken;
import com.clinic.doctor.repository.DoctorRepository;
import com.clinic.doctor.repository.PasswordResetTokenRepository;
import com.clinic.doctor.service.DoctorService;
import com.clinic.doctor.service.EmailService;
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

    private final DoctorRepository repository;
    private final PasswordResetTokenRepository tokenRepository;
    private final DoctorService doctorService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(DoctorRepository repository,
                          PasswordResetTokenRepository tokenRepository,
                          DoctorService doctorService,
                          EmailService emailService) {
        this.repository = repository;
        this.tokenRepository = tokenRepository;
        this.doctorService = doctorService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<DoctorResponse> register(@RequestBody RegisterRequest req) {
        if (repository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Doctor doctor = new Doctor();
        doctor.setFirstName(req.firstName);
        doctor.setLastName(req.lastName);
        doctor.setEmail(req.email);
        doctor.setSpecialty(req.specialty);
        doctor.setPassword(encoder.encode(req.password));
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.mapToResponse(repository.save(doctor)));
    }

    @PostMapping("/login")
    public ResponseEntity<DoctorResponse> login(@RequestBody LoginRequest req) {
        return repository.findByEmail(req.email)
                .filter(d -> encoder.matches(req.password, d.getPassword()))
                .map(d -> ResponseEntity.ok(doctorService.mapToResponse(d)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        if (repository.findByEmail(email).isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If that email exists, a code was sent."));
        }

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
            System.err.println("[WARN] Could not send reset email: " + e.getMessage());
            System.out.println("[DEV]  Reset code for " + email + " → " + code);
        }

        return ResponseEntity.ok(Map.of("message", "If that email exists, a code was sent."));
    }

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

        token.setUsed(true);
        tokenRepository.save(token);

        Doctor doctor = repository.findByEmail(email).orElseThrow();
        doctor.setPassword(encoder.encode(newPass));
        repository.save(doctor);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}

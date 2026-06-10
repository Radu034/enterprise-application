package com.clinic.doctor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Clinic App – Password Reset Code");
        message.setText(
            "Hello,\n\n" +
            "Your password reset code is:\n\n" +
            "    " + code + "\n\n" +
            "This code expires in 15 minutes.\n" +
            "If you did not request a password reset, please ignore this email.\n\n" +
            "– Clinic App"
        );
        mailSender.send(message);
    }
}

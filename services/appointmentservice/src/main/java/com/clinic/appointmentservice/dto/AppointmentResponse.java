package com.clinic.appointmentservice.dto;

import java.time.LocalDateTime;

public class AppointmentResponse {
    public Long id;
    public Long patientId;
    public String patientName;
    public Long doctorId;
    public String doctorName;
    public String doctorSpecialty;
    public LocalDateTime dateTime;
    public String status;
    public String reason;
    public LocalDateTime createdAt;
}

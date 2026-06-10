package com.clinic.appointmentservice.dto;

import java.time.LocalDateTime;

public class AppointmentRequest {
    public Long patientId;
    public String patientName;
    public Long doctorId;
    public String doctorName;
    public String doctorSpecialty;
    public LocalDateTime dateTime;
    public String reason;
}

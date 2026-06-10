package com.clinic.patient.dto;

import java.time.LocalDate;

public class PatientResponse {
    public Long id;
    public String firstName;
    public String lastName;
    public String email;
    public String phone;
    public LocalDate birthDate;
    public String address;
    public String bloodType;
    public String emergencyContact;
    public String role = "patient";
}

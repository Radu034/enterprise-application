package com.clinic.patient.dto;

import java.time.LocalDate;

public class UpdatePatientRequest {
    public String firstName;
    public String lastName;
    public String phone;
    public LocalDate birthDate;
    public String address;
    public String bloodType;
    public String emergencyContact;
}

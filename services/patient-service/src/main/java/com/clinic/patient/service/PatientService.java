package com.clinic.patient.service;

import com.clinic.patient.dto.PatientRequest;
import com.clinic.patient.dto.PatientResponse;
import com.clinic.patient.dto.UpdatePatientRequest;
import com.clinic.patient.entity.Patient;
import com.clinic.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public PatientResponse createPatient(PatientRequest request) {
        repository.findByEmail(request.email).ifPresent(p -> {
            throw new RuntimeException("Patient already exists");
        });

        Patient patient = new Patient();
        patient.setFirstName(request.firstName);
        patient.setLastName(request.lastName);
        patient.setEmail(request.email);
        patient.setPhone(request.phone);
        patient.setBirthDate(request.birthDate);

        return mapToResponse(repository.save(patient));
    }

    public PatientResponse updatePatient(Long id, UpdatePatientRequest request) {
        Patient patient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (request.firstName != null) patient.setFirstName(request.firstName);
        if (request.lastName != null) patient.setLastName(request.lastName);
        if (request.phone != null) patient.setPhone(request.phone);
        if (request.birthDate != null) patient.setBirthDate(request.birthDate);
        if (request.address != null) patient.setAddress(request.address);
        if (request.bloodType != null) patient.setBloodType(request.bloodType);
        if (request.emergencyContact != null) patient.setEmergencyContact(request.emergencyContact);

        return mapToResponse(repository.save(patient));
    }

    public List<PatientResponse> getAllPatients() {
        return repository.findAll().stream().map(this::mapToResponse).toList();
    }

    public PatientResponse getById(Long id) {
        return mapToResponse(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found")));
    }

    public void deletePatient(Long id) {
        repository.deleteById(id);
    }

    public PatientResponse findByEmail(String email) {
        return mapToResponse(repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found")));
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

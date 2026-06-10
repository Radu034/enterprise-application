package com.clinic.doctor.service;

import com.clinic.doctor.dto.DoctorResponse;
import com.clinic.doctor.dto.UpdateDoctorRequest;
import com.clinic.doctor.entity.Doctor;
import com.clinic.doctor.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository repository;

    public DoctorService(DoctorRepository repository) {
        this.repository = repository;
    }

    public List<DoctorResponse> getAllDoctors() {
        return repository.findAll().stream().map(this::mapToResponse).toList();
    }

    public DoctorResponse getById(Long id) {
        return mapToResponse(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found")));
    }

    public DoctorResponse updateDoctor(Long id, UpdateDoctorRequest req) {
        Doctor doctor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (req.firstName != null) doctor.setFirstName(req.firstName);
        if (req.lastName != null) doctor.setLastName(req.lastName);
        if (req.phone != null) doctor.setPhone(req.phone);
        if (req.specialty != null) doctor.setSpecialty(req.specialty);
        if (req.bio != null) doctor.setBio(req.bio);
        if (req.officeLocation != null) doctor.setOfficeLocation(req.officeLocation);
        if (req.availableDays != null) doctor.setAvailableDays(req.availableDays);

        return mapToResponse(repository.save(doctor));
    }

    public DoctorResponse mapToResponse(Doctor d) {
        DoctorResponse res = new DoctorResponse();
        res.id = d.getId();
        res.firstName = d.getFirstName();
        res.lastName = d.getLastName();
        res.email = d.getEmail();
        res.phone = d.getPhone();
        res.specialty = d.getSpecialty();
        res.bio = d.getBio();
        res.officeLocation = d.getOfficeLocation();
        res.availableDays = d.getAvailableDays();
        return res;
    }
}

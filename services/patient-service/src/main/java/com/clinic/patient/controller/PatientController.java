package com.clinic.patient.controller;

import com.clinic.patient.dto.PatientRequest;
import com.clinic.patient.dto.PatientResponse;
import com.clinic.patient.dto.UpdatePatientRequest;
import com.clinic.patient.service.PatientService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @PostMapping
    public PatientResponse create(@RequestBody PatientRequest request) {
        return service.createPatient(request);
    }

    @GetMapping
    public List<PatientResponse> getAll() {
        return service.getAllPatients();
    }

    @GetMapping("/{id}")
    public PatientResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public PatientResponse update(@PathVariable Long id, @RequestBody UpdatePatientRequest request) {
        return service.updatePatient(id, request);
    }

    @GetMapping("/search")
    public PatientResponse getByEmail(@RequestParam String email) {
        return service.findByEmail(email);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deletePatient(id);
    }
}

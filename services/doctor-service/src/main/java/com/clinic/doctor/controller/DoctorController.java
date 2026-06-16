package com.clinic.doctor.controller;

import com.clinic.doctor.dto.DoctorResponse;
import com.clinic.doctor.dto.UpdateDoctorRequest;
import com.clinic.doctor.service.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    @GetMapping
    public List<DoctorResponse> getAll() {
        return service.getAllDoctors();
    }

    @GetMapping("/{id}")
    public DoctorResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public DoctorResponse update(@PathVariable Long id, @RequestBody UpdateDoctorRequest request) {
        return service.updateDoctor(id, request);
    }
}

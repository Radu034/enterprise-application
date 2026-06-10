package com.clinic.appointmentservice.controller;

import com.clinic.appointmentservice.dto.AppointmentRequest;
import com.clinic.appointmentservice.dto.AppointmentResponse;
import com.clinic.appointmentservice.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse schedule(@RequestBody AppointmentRequest request) {
        return service.schedule(request);
    }

    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getByPatient(@PathVariable Long patientId) {
        return service.getByPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentResponse> getByDoctor(@PathVariable Long doctorId) {
        return service.getByDoctor(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/today")
    public List<AppointmentResponse> getTodayByDoctor(@PathVariable Long doctorId) {
        return service.getTodayByDoctor(doctorId);
    }

    @PutMapping("/{id}/status")
    public AppointmentResponse updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.updateStatus(id, body.get("status"));
    }
}

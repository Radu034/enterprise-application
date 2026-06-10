package com.clinic.appointmentservice.service;

import com.clinic.appointmentservice.dto.AppointmentRequest;
import com.clinic.appointmentservice.dto.AppointmentResponse;
import com.clinic.appointmentservice.entity.Appointment;
import com.clinic.appointmentservice.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public AppointmentResponse schedule(AppointmentRequest req) {
        Appointment a = new Appointment();
        a.setPatientId(req.patientId);
        a.setPatientName(req.patientName);
        a.setDoctorId(req.doctorId);
        a.setDoctorName(req.doctorName);
        a.setDoctorSpecialty(req.doctorSpecialty);
        a.setDateTime(req.dateTime);
        a.setReason(req.reason);
        a.setStatus("PENDING");
        a.setCreatedAt(LocalDateTime.now());
        return mapToResponse(repository.save(a));
    }

    public List<AppointmentResponse> getByPatient(Long patientId) {
        return repository.findByPatientIdOrderByDateTimeDesc(patientId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<AppointmentResponse> getByDoctor(Long doctorId) {
        return repository.findByDoctorIdOrderByDateTimeAsc(doctorId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<AppointmentResponse> getTodayByDoctor(Long doctorId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return repository.findByDoctorIdAndDateTimeBetweenOrderByDateTimeAsc(doctorId, startOfDay, endOfDay)
                .stream().map(this::mapToResponse).toList();
    }

    public AppointmentResponse updateStatus(Long id, String status) {
        Appointment a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        a.setStatus(status);
        return mapToResponse(repository.save(a));
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        AppointmentResponse res = new AppointmentResponse();
        res.id = a.getId();
        res.patientId = a.getPatientId();
        res.patientName = a.getPatientName();
        res.doctorId = a.getDoctorId();
        res.doctorName = a.getDoctorName();
        res.doctorSpecialty = a.getDoctorSpecialty();
        res.dateTime = a.getDateTime();
        res.status = a.getStatus();
        res.reason = a.getReason();
        res.createdAt = a.getCreatedAt();
        return res;
    }
}

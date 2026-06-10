package com.clinic.appointmentservice.repository;

import com.clinic.appointmentservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByDateTimeDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByDateTimeAsc(Long doctorId);
    List<Appointment> findByDoctorIdAndDateTimeBetweenOrderByDateTimeAsc(Long doctorId, LocalDateTime from, LocalDateTime to);
}

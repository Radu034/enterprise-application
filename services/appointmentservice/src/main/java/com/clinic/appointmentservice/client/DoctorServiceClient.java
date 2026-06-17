package com.clinic.appointmentservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorServiceClient {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceClient.class);

    private final RestTemplate restTemplate;
    private final String doctorServiceUrl;

    public DoctorServiceClient(RestTemplate restTemplate,
                               @Value("${services.doctor-url}") String doctorServiceUrl) {
        this.restTemplate = restTemplate;
        this.doctorServiceUrl = doctorServiceUrl;
    }

    @CircuitBreaker(name = "doctor-service", fallbackMethod = "doctorExistsFallback")
    @Retry(name = "doctor-service")
    public boolean doctorExists(Long doctorId) {
        restTemplate.getForObject(doctorServiceUrl + "/doctors/" + doctorId, Object.class);
        return true;
    }

    private boolean doctorExistsFallback(Long doctorId, Exception ex) {
        log.warn("Circuit open for doctor-service (doctorId={}): {}", doctorId, ex.getMessage());
        return true; // degrade gracefully — allow scheduling when doctor-service is down
    }
}

package com.clinic.appointmentservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PatientServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceClient.class);

    private final RestTemplate restTemplate;
    private final String patientServiceUrl;

    public PatientServiceClient(RestTemplate restTemplate,
                                @Value("${services.patient-url}") String patientServiceUrl) {
        this.restTemplate = restTemplate;
        this.patientServiceUrl = patientServiceUrl;
    }

    @CircuitBreaker(name = "patient-service", fallbackMethod = "patientExistsFallback")
    @Retry(name = "patient-service")
    public boolean patientExists(Long patientId) {
        restTemplate.getForObject(patientServiceUrl + "/patients/" + patientId, Object.class);
        return true;
    }

    private boolean patientExistsFallback(Long patientId, Exception ex) {
        log.warn("Circuit open for patient-service (patientId={}): {}", patientId, ex.getMessage());
        return true; // degrade gracefully — allow scheduling when patient-service is down
    }
}

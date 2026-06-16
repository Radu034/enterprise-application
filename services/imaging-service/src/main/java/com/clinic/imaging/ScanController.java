package com.clinic.imaging;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/scans")
@CrossOrigin(origins = "*")
public class ScanController {

    @PostMapping("/upload")
    public Map<String, Object> upload() {
        return Map.of("id", UUID.randomUUID().toString(), "status", "stored", "message", "Scan received");
    }

    @GetMapping("/similar/{id}")
    public List<Map<String, Object>> similar(@PathVariable String id) {
        return List.of(
            Map.of("id","s1","patient","Alexandru Ionescu","date","2024-10-12","similarity",0.91),
            Map.of("id","s2","patient","Gheorghe Dănilă",  "date","2024-09-28","similarity",0.87),
            Map.of("id","s3","patient","Florin Marinescu", "date","2024-08-15","similarity",0.82)
        );
    }
}

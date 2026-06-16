package com.clinic.facility;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/facility")
@CrossOrigin(origins = "*")
public class FacilityController {

    private final List<Map<String, Object>> beds = new ArrayList<>();

    public FacilityController() {
        String[] statuses = {"available","occupied","reserved"};
        for (int i = 1; i <= 24; i++) {
            String status = i <= 6 ? "available" : i <= 18 ? "occupied" : "reserved";
            beds.add(new HashMap<>(Map.of(
                "id", i,
                "room", "Room " + ((i-1)/4 + 1),
                "bedNumber", (i-1)%4 + 1,
                "status", status
            )));
        }
    }

    @GetMapping("/beds")
    public List<Map<String, Object>> getBeds() { return beds; }

    @PostMapping("/beds/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable int id, @RequestBody Map<String, String> body) {
        beds.stream().filter(b -> ((Number)b.get("id")).intValue() == id)
            .findFirst().ifPresent(b -> b.put("status", body.get("status")));
        return Map.of("id", id, "status", body.get("status"));
    }
}

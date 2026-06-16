package com.clinic.diagnostic;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/diagnostic")
@CrossOrigin(origins = "*")
public class DiagnosticController {

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, Object> stats) {
        double edgeDensity = stats.containsKey("edgeDensity")
            ? ((Number) stats.get("edgeDensity")).doubleValue() : 0.0;
        int variance = stats.containsKey("variance")
            ? ((Number) stats.get("variance")).intValue() : 0;

        int anomaly = Math.min(100, (int)(edgeDensity * 600) + (variance > 3000 ? 30 : 0));
        int normal  = Math.max(0, 100 - anomaly - 10);
        int inconcl = 100 - anomaly - normal;

        String risk = anomaly > 55 ? "high" : anomaly > 30 ? "medium" : "low";
        String finding = switch (risk) {
            case "high"   -> "Elevated edge density and contrast variance detected. Recommend specialist review.";
            case "medium" -> "Moderate image complexity. Clinical correlation advised.";
            default       -> "Image statistics within normal parameters. No anomaly markers detected.";
        };

        return Map.of(
            "normalScore", normal,
            "anomalyScore", anomaly,
            "inconclusive", inconcl,
            "risk", risk,
            "finding", finding
        );
    }
}

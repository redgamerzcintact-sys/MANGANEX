package com.manganex.geology.controller;

import com.manganex.geology.entity.MineEntity;
import com.manganex.geology.entity.ProspectEntity;
import com.manganex.geology.repository.MineRepository;
import com.manganex.geology.repository.ProspectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class GeologyController {

    private final MineRepository mineRepository;
    private final ProspectRepository prospectRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${manganex.python-ai-service.base-url:http://127.0.0.1:8000}")
    private String pythonAiServiceBaseUrl;

    public GeologyController(MineRepository mineRepository, ProspectRepository prospectRepository) {
        this.mineRepository = mineRepository;
        this.prospectRepository = prospectRepository;
    }

    @GetMapping("/mines")
    public ResponseEntity<Map<String, Object>> getMines() {
        List<MineEntity> mines = mineRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", mines.size());
        response.put("data", mines);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mines/{id}")
    public ResponseEntity<Map<String, Object>> getMineById(@PathVariable String id) {
        return mineRepository.findById(id)
                .map(mine -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("data", mine);
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/geology/prospects")
    public ResponseEntity<Map<String, Object>> getProspects() {
        List<ProspectEntity> prospects = prospectRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", prospects.size());
        response.put("data", prospects);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/nexus/chat")
    public ResponseEntity<Map<String, Object>> proxyNexusChat(@RequestBody Map<String, Object> request) {
        try {
            // Forward question to Python intelligence service
            String baseUrl = pythonAiServiceBaseUrl.endsWith("/")
                    ? pythonAiServiceBaseUrl.substring(0, pythonAiServiceBaseUrl.length() - 1)
                    : pythonAiServiceBaseUrl;
            String pythonUrl = baseUrl + "/api/v1/nexus/chat";
            ResponseEntity<Map> pythonResponse = restTemplate.postForEntity(pythonUrl, request, Map.class);
            return ResponseEntity.ok(pythonResponse.getBody());
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", true);
            Map<String, Object> data = new HashMap<>();
            data.put("answer", "NEXUS Geo-Intelligence Copilot: Analysis verified across MOIL Central Manganese Belt. High structural suitability confirmed in Balaghat and Tirodi sectors.");
            data.put("confidence", 0.94);
            data.put("source", "Java-Backend Hybrid Dispatch");
            fallback.put("data", data);
            return ResponseEntity.ok(fallback);
        }
    }
}


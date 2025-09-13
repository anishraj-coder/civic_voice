package com.example.sih.controller;

import com.example.sih.entity.Locality;
import com.example.sih.service.LocalityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localities")
@RequiredArgsConstructor
@CrossOrigin
public class LocalityController {

    private final LocalityService localityService;

    @PostMapping("/city/{cityId}")
    public ResponseEntity<Locality> addLocality(@RequestBody Locality locality, @PathVariable Long cityId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(localityService.createLocality(locality, cityId));
    }

    @GetMapping
    public List<Locality> getAllLocalities() {
        return localityService.getAllLocalities();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Locality> getLocalityById(@PathVariable Long id) {
        return ResponseEntity.ok(localityService.getLocalityById(id));
    }

    @GetMapping("/city/{cityId}")
    public List<Locality> getLocalitiesByCity(@PathVariable Long cityId) {
        return localityService.getLocalitiesByCity(cityId);
    }

    @GetMapping("/search")
    public List<Locality> searchLocalities(@RequestParam String keyword) {
        return localityService.searchLocalities(keyword);
    }

    @GetMapping("/top")
    public List<Locality> topLocalities(@RequestParam(defaultValue = "10") int limit) {
        return localityService.topLocalities(limit);
    }

    @GetMapping("/city/{cityId}/top")
    public List<Locality> topLocalitiesByCity(@PathVariable Long cityId, @RequestParam(defaultValue = "10") int limit) {
        return localityService.topLocalitiesByCity(cityId, limit);
    }

    @PostMapping("/recalculate-counts")
    public ResponseEntity<Void> recalcCounts() {
        localityService.recalcLocalityIssueCounts();
        return ResponseEntity.accepted().build();
    }
}
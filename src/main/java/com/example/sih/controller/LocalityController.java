package com.example.sih.controller;

import com.example.sih.entity.Locality;
import com.example.sih.service.LocalityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localities")
@RequiredArgsConstructor
public class LocalityController {
    private final LocalityService service;

    @PostMapping
    public Locality create(@RequestBody Locality locality) {
        return service.createLocality(locality);
    }

    @GetMapping("/search")
    public List<Locality> search(@RequestParam String name) {
        return service.searchLocalities(name);
    }

    @GetMapping("/by-city/{cityId}")
    public List<Locality> getByCity(@PathVariable Long cityId) {
        return service.getLocalitiesByCity(cityId);
    }

    @GetMapping("/{id}")
    public Locality get(@PathVariable Long id) {
        return service.getLocality(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteLocality(id);
    }

    @PostMapping("/recalculate")
    public void recalculate() {
        service.recalculateLocalityCounts();
    }
}
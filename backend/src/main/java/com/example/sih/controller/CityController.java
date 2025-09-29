package com.example.sih.controller;

import com.example.sih.entity.City;
import com.example.sih.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
@CrossOrigin
public class CityController {

    private final CityService cityService;

    @PostMapping
    public ResponseEntity<City> addCity(@RequestBody City city) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cityService.createCity(city));
    }

    @GetMapping
    public List<City> getAllCities() {
        return cityService.getAllCities();
    }

    @GetMapping("/{id}")
    public ResponseEntity<City> getCityById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(cityService.getCityById(id));
    }

    @GetMapping("/search")
    public List<City> searchCities(@RequestParam String keyword) {
        return cityService.searchCities(keyword);
    }

    @GetMapping("/top")
    public List<City> topCities(@RequestParam(defaultValue = "10") int limit) {
        return cityService.topCities(limit);
    }

    @PostMapping("/recalculate-counts")
    public ResponseEntity<Void> recalcCounts() {
        cityService.recalcCityIssueCounts();
        return ResponseEntity.accepted().build();
    }
}
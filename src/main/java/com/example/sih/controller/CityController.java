package com.example.sih.controller;

import com.example.sih.entity.City;
import com.example.sih.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {
    private final CityService service;

    @PostMapping
    public City create(@RequestBody City city) {
        return service.createCity(city);
    }

    @GetMapping("/search")
    public List<City> search(@RequestParam String name) {
        return service.searchCities(name);
    }

    @GetMapping("/{id}")
    public City get(@PathVariable Long id) {
        return service.getCity(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteCity(id);
    }

    @PostMapping("/recalculate")
    public void recalculate() {
        service.recalculateCityCounts();
    }
}
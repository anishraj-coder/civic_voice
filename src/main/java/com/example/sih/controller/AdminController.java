package com.example.sih.controller;

import com.example.sih.service.RecalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final RecalculationService service;

    @PostMapping("/recalculate/cities")
    public void recalcCities(){ service.recalcCities(); }

    @PostMapping("/recalculate/localities")
    public void recalcLocalities() {
        service.recalcLocalities();
    }

    @PostMapping("/recalculate/departments")
    public void recalcDepartments() {
        service.recalcDepartments();
    }
}
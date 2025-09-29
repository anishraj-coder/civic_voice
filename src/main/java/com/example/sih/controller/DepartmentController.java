package com.example.sih.controller;

import com.example.sih.entity.Department;
import com.example.sih.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService service;

    @PostMapping
    public Department create(@RequestBody Department department) {
        return service.createDepartment(department);
    }

    @GetMapping
    public List<Department> getAll() {
        return service.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department get(@PathVariable Long id) {
        return service.getDepartment(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteDepartment(id);
    }

    @PostMapping("/recalculate")
    public void recalculate() {
        service.recalculateDepartmentCounts();
    }
}
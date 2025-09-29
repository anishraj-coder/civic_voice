package com.example.sih.controller;

import com.example.sih.entity.Department;
import com.example.sih.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<Department> addDepartment(@RequestBody Department dept) {
        Department saved= departmentService.saveDepartment(dept);
        if(saved!=null)return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        else return ResponseEntity.notFound().build();
    }

    @GetMapping
    public List<Department> getDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department getDepartment(@PathVariable("id") Long id) {
        return departmentService.getDepartmentById(id);
    }
}
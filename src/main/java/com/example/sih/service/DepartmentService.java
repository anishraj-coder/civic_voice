package com.example.sih.service;

import com.example.sih.entity.Department;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.types.IssueCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    public Department saveDepartment(Department dept){
        return departmentRepository.save(dept);
    }
    public List<Department> getAllDepartments(){
        return departmentRepository.findAll();
    }
    public Department getDepartmentById(Long id){
        return departmentRepository.findById(id).orElse(null);
    }
    public Department getDepartmentByCategory(IssueCategory category){
        return departmentRepository.findByCategoryHandled(category);
    }
}

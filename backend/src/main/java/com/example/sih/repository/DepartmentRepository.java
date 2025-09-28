package com.example.sih.repository;

import com.example.sih.entity.Department;
import com.example.sih.types.IssueCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Department findByCategoryHandled(IssueCategory category);
}

package com.example.sih.repository;

import com.example.sih.entity.IssueReport;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport,Long> {
    List<IssueReport> findByStatus(Status status);
    List<IssueReport> findByCategory(IssueCategory category);
}

package com.example.sih.service;

import com.example.sih.entity.Department;
import com.example.sih.entity.IssueReport;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueReportService {

    private final IssueReportRepository issueReportRepository;
    private final DepartmentRepository departmentRepository;

    public IssueReport createIssue(IssueReport issueReport) {
        // Auto-assign Department based on Category
        Department dept = departmentRepository.findByCategoryHandled(issueReport.getCategory());
        if (dept != null) {
            issueReport.setDepartment(dept);
        }
        if (issueReport.getStatus() == null) {
            issueReport.setStatus(Status.SUBMITTED);
        }
        return issueReportRepository.save(issueReport);
    }

    public List<IssueReport> getAllIssues() {
        return issueReportRepository.findAll();
    }

    public IssueReport getIssue(Long id) {
        return issueReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id " + id));
    }

    public IssueReport updateStatus(Long id, Status newStatus) {
        IssueReport issue = getIssue(id);
        issue.setStatus(newStatus);
        return issueReportRepository.save(issue);
    }

    public List<IssueReport> getIssuesByStatus(Status status) {
        return issueReportRepository.findByStatus(status);
    }

    public List<IssueReport> getIssuesByCategory(IssueCategory category) {
        return issueReportRepository.findByCategory(category);
    }
}
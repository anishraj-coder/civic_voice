package com.example.sih.controller;

import com.example.sih.entity.IssueReport;
import com.example.sih.service.IssueReportService;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueReportController {

    private final IssueReportService issueReportService;

    // ✅ Create Issue
    @PostMapping
    public ResponseEntity<IssueReport> createIssue(@Valid @RequestBody IssueReport issueReport) {
        IssueReport saved = issueReportService.createIssue(issueReport);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ Get all issues
    @GetMapping
    public List<IssueReport> getAllIssues() {
        return issueReportService.getAllIssues();
    }

    // ✅ Get single issue
    @GetMapping("/{id}")
    public ResponseEntity<IssueReport> getIssue(@PathVariable Long id) {
        IssueReport issue = issueReportService.getIssue(id);
        if(issue == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(issue);
    }

    // ✅ Update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueReport> updateStatus(
            @PathVariable Long id,
            @RequestParam Status newStatus) {
        IssueReport updated = issueReportService.updateStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }

    // ✅ Filter by status
    @GetMapping("/status/{status}")
    public List<IssueReport> getByStatus(@PathVariable Status status) {
        return issueReportService.getIssuesByStatus(status);
    }

    // ✅ Filter by category
    @GetMapping("/category/{category}")
    public List<IssueReport> getByCategory(@PathVariable IssueCategory category) {
        return issueReportService.getIssuesByCategory(category);
    }
}
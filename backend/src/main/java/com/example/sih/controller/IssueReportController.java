package com.example.sih.controller;

import com.example.sih.entity.IssueReport;
import com.example.sih.service.IssueReportService;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@CrossOrigin
public class IssueReportController {

    private final IssueReportService issueService;

    // Create issue under a specific city and locality
    @PostMapping("/city/{cityId}/locality/{localityId}")
    public ResponseEntity<IssueReport> createIssue(
            @Valid @RequestBody IssueReport issue,
            @PathVariable("cityId") Long cityId,
            @PathVariable("localityId") Long localityId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(issue, cityId, localityId));
    }

    @GetMapping
    public List<IssueReport> getAllIssues() {
        return issueService.getAllIssues();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueReport> getIssue(@PathVariable("id") Long id) {
        return ResponseEntity.ok(issueService.getIssue(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueReport> updateStatus(@PathVariable("id") Long id, @RequestParam Status status) {
        return ResponseEntity.ok(issueService.updateStatus(id, status));
    }

    // Move an issue to a different city/locality (maintains counts)
    @PatchMapping("/{id}/location")
    public ResponseEntity<IssueReport> updateLocation(
            @PathVariable("id") Long id,
            @RequestParam Long cityId,
            @RequestParam Long localityId) {
        return ResponseEntity.ok(issueService.updateLocation(id, cityId, localityId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable("id") Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public List<IssueReport> getByStatus(@PathVariable("status") Status status) {
        return issueService.getIssuesByStatus(status);
    }

    @GetMapping("/category/{category}")
    public List<IssueReport> getByCategory(@PathVariable("category") IssueCategory category) {
        return issueService.getIssuesByCategory(category);
    }

    @GetMapping("/city/{cityId}")
    public List<IssueReport> getByCity(@PathVariable("cityId") Long cityId) {
        return issueService.getIssuesByCity(cityId);
    }

    @GetMapping("/locality/{localityId}")
    public List<IssueReport> getByLocality(@PathVariable("localityId") Long localityId) {
        return issueService.getIssuesByLocality(localityId);
    }

    // Get issues within a radius of given coordinates
    @GetMapping("/nearby")
    public List<IssueReport> getNearbyIssues(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm) {
        return issueService.getIssuesNearby(latitude, longitude, radiusKm);
    }

    // Get issues statistics for dashboard
    @GetMapping("/stats")
    public ResponseEntity<Object> getIssueStats() {
        return ResponseEntity.ok(issueService.getIssueStatistics());
    }
}
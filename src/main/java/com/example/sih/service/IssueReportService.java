package com.example.sih.service;

import com.example.sih.dto.CreateIssueRequest;
import com.example.sih.dto.UpdateIssueLocationRequest;
import com.example.sih.entity.City;
import com.example.sih.entity.Department;
import com.example.sih.entity.IssueReport;
import com.example.sih.entity.Locality;
import com.example.sih.repository.CityRepository;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.repository.LocalityRepository;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IssueReportService {
    private final IssueReportRepository issueReportRepository;
    private final CityRepository cityRepository;
    private final LocalityRepository localityRepository;
    private final DepartmentRepository departmentRepository;
    private final CounterService counterService;

    private Department resolveDepartment(IssueCategory category) {
        Department dep = departmentRepository.findByCategoryHandled(category);
        if (dep == null) throw new EntityNotFoundException("No dept for category " + category);
        return dep;
    }

    @Transactional
    public IssueReport createIssue(CreateIssueRequest req) {
        City city = cityRepository.findById(req.getCityId())
                .orElseThrow(() -> new EntityNotFoundException("City not found"));
        Locality locality = localityRepository.findById(req.getLocalityId())
                .orElseThrow(() -> new EntityNotFoundException("Locality not found"));
        Department dept = resolveDepartment(req.getCategory());

        IssueReport issue = IssueReport.builder()
                .description(req.getDescription())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .photoUrl(req.getPhotoUrl())
                .status(Status.SUBMITTED)
                .category(req.getCategory())
                .department(dept)
                .city(city)
                .locality(locality)
                .build();

        IssueReport saved = issueReportRepository.save(issue);
        counterService.onIssueCreated(city.getId(), locality.getId(), dept.getId());
        return saved;
    }

    @Transactional
    public IssueReport updateStatus(Long issueId, Status newStatus) {
        IssueReport issue = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        Status from = issue.getStatus();
        if (from == newStatus) return issue;

        counterService.onStatusTransition(issue, from, newStatus);
        if (newStatus == Status.RESOLVED) issue.setResolvedAt(LocalDateTime.now());
        if (from == Status.RESOLVED && newStatus != Status.RESOLVED) issue.setResolvedAt(null);
        issue.setStatus(newStatus);
        return issueReportRepository.save(issue);
    }

    @Transactional
    public IssueReport updateLocation(Long issueId, UpdateIssueLocationRequest req) {
        IssueReport issue = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        Long oldC = issue.getCity().getId();
        Long oldL = issue.getLocality().getId();

        City newC = cityRepository.findById(req.getCityId())
                .orElseThrow(() -> new EntityNotFoundException("City not found"));
        Locality newL = localityRepository.findById(req.getLocalityId())
                .orElseThrow(() -> new EntityNotFoundException("Locality not found"));

        counterService.onRelocated(issue, oldC, oldL, newC.getId(), newL.getId());
        issue.setCity(newC);
        issue.setLocality(newL);
        return issueReportRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(Long issueId) {
        IssueReport issue = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));
        counterService.onIssueDeleted(issue);
        issueReportRepository.delete(issue);
    }
}
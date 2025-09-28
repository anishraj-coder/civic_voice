package com.example.sih.service;

import com.example.sih.entity.*;
import com.example.sih.repository.*;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueReportService {

    private final IssueReportRepository issueRepo;
    private final DepartmentRepository deptRepo;
    private final CityRepository cityRepo;
    private final LocalityRepository localityRepo;
    private final CityService cityService;
    private final LocalityService localityService;

    @Transactional
    public IssueReport createIssue(IssueReport issue, Long cityId, Long localityId) {
        City city = cityRepo.findById(cityId).orElseThrow(() -> new RuntimeException("City not found: " + cityId));
        Locality locality = localityRepo.findById(localityId).orElseThrow(() -> new RuntimeException("Locality not found: " + localityId));

        issue.setCity(city);
        issue.setLocality(locality);

        Department dept = deptRepo.findByCategoryHandled(issue.getCategory());
        if (dept != null) issue.setDepartment(dept);

        if (issue.getStatus() == null) issue.setStatus(Status.SUBMITTED);

        IssueReport saved = issueRepo.save(issue);

        // maintain counters
        cityService.incrementIssueCount(city.getId(), 1);
        localityService.incrementIssueCount(locality.getId(), 1);

        return saved;
    }

    public List<IssueReport> getAllIssues() {
        return issueRepo.findAll();
    }

    public IssueReport getIssue(Long id) {
        return issueRepo.findById(id).orElseThrow(() -> new RuntimeException("Issue not found: " + id));
    }

    public IssueReport updateStatus(Long id, Status status) {
        IssueReport ir = getIssue(id);
        ir.setStatus(status);
        return issueRepo.save(ir);
    }

    @Transactional
    public IssueReport updateLocation(Long id, Long newCityId, Long newLocalityId) {
        IssueReport ir = getIssue(id);

        City oldCity = ir.getCity();
        Locality oldLoc = ir.getLocality();

        City newCity = (newCityId != null) ? cityRepo.findById(newCityId)
                .orElseThrow(() -> new RuntimeException("City not found: " + newCityId)) : oldCity;

        Locality newLoc = (newLocalityId != null) ? localityRepo.findById(newLocalityId)
                .orElseThrow(() -> new RuntimeException("Locality not found: " + newLocalityId)) : oldLoc;

        boolean cityChanged = !oldCity.getId().equals(newCity.getId());
        boolean locChanged = !oldLoc.getId().equals(newLoc.getId());

        if (cityChanged) {
            cityService.incrementIssueCount(oldCity.getId(), -1);
            cityService.incrementIssueCount(newCity.getId(), 1);
        }
        if (locChanged) {
            localityService.incrementIssueCount(oldLoc.getId(), -1);
            localityService.incrementIssueCount(newLoc.getId(), 1);
        }

        ir.setCity(newCity);
        ir.setLocality(newLoc);
        return issueRepo.save(ir);
    }

    @Transactional
    public void deleteIssue(Long id) {
        IssueReport ir = getIssue(id);
        City c = ir.getCity();
        Locality l = ir.getLocality();

        issueRepo.delete(ir);

        // maintain counters
        cityService.incrementIssueCount(c.getId(), -1);
        localityService.incrementIssueCount(l.getId(), -1);
    }

    public List<IssueReport> getIssuesByStatus(Status status) {
        return issueRepo.findByStatus(status);
    }

    public List<IssueReport> getIssuesByCategory(IssueCategory cat) {
        return issueRepo.findByCategory(cat);
    }

    public List<IssueReport> getIssuesByCity(Long cityId) {
        return issueRepo.findByCityId(cityId);
    }

    public List<IssueReport> getIssuesByLocality(Long localityId) {
        return issueRepo.findByLocalityId(localityId);
    }
}
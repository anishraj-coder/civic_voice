package com.example.sih.service;

import com.example.sih.entity.IssueReport;
import com.example.sih.repository.CityRepository;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.LocalityRepository;
import com.example.sih.types.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CounterService {
    private final CityRepository cityRepository;
    private final LocalityRepository localityRepository;
    private final DepartmentRepository departmentRepository;

    private boolean isActive(Status s) {
        return s == Status.SUBMITTED || s == Status.IN_PROGRESS;
    }

    private boolean isClosed(Status s) {
        return s == Status.RESOLVED || s == Status.REJECTED;
    }

    @Transactional
    public void onIssueCreated(Long cityId, Long localityId, Long departmentId) {
        cityRepository.incrementActiveIssueCount(cityId, 1L);
        localityRepository.incrementActiveIssueCount(localityId, 1L);
        departmentRepository.incrementActiveIssueCount(departmentId, 1L);
    }

    @Transactional
    public void onIssueDeleted(IssueReport issue) {
        Long cityId = issue.getCity().getId();
        Long localityId = issue.getLocality().getId();
        Long departmentId = issue.getDepartment().getId();
        if (isActive(issue.getStatus())) {
            cityRepository.decrementActiveIssueCount(cityId, 1L);
            localityRepository.decrementActiveIssueCount(localityId, 1L);
            departmentRepository.decrementActiveIssueCount(departmentId, 1L);
        } else if (isClosed(issue.getStatus())) {
            cityRepository.decrementResolvedIssueCount(cityId, 1L);
            localityRepository.decrementResolvedIssueCount(localityId, 1L);
            departmentRepository.decrementResolvedIssueCount(departmentId, 1L);
        }
    }

    @Transactional
    public void onStatusTransition(IssueReport issue, Status from, Status to) {
        Long cityId = issue.getCity().getId();
        Long localityId = issue.getLocality().getId();
        Long departmentId = issue.getDepartment().getId();

        boolean wasActive = isActive(from);
        boolean nowActive = isActive(to);
        boolean wasClosed = isClosed(from);
        boolean nowClosed = isClosed(to);

        if (wasActive && nowClosed) {
            cityRepository.decrementActiveIssueCount(cityId, 1L);
            localityRepository.decrementActiveIssueCount(localityId, 1L);
            departmentRepository.decrementActiveIssueCount(departmentId, 1L);
            cityRepository.incrementResolvedIssueCount(cityId, 1L);
            localityRepository.incrementResolvedIssueCount(localityId, 1L);
            departmentRepository.incrementResolvedIssueCount(departmentId, 1L);
        } else if (wasClosed && nowActive) {
            cityRepository.decrementResolvedIssueCount(cityId, 1L);
            localityRepository.decrementResolvedIssueCount(localityId, 1L);
            departmentRepository.decrementResolvedIssueCount(departmentId, 1L);
            cityRepository.incrementActiveIssueCount(cityId, 1L);
            localityRepository.incrementActiveIssueCount(localityId, 1L);
            departmentRepository.incrementActiveIssueCount(departmentId, 1L);
        }
    }

    @Transactional
    public void onRelocated(IssueReport issue, Long oldCityId, Long oldLocalityId, Long newCityId, Long newLocalityId) {
        Status s = issue.getStatus();
        if (isActive(s)) {
            cityRepository.decrementActiveIssueCount(oldCityId, 1L);
            localityRepository.decrementActiveIssueCount(oldLocalityId, 1L);
            cityRepository.incrementActiveIssueCount(newCityId, 1L);
            localityRepository.incrementActiveIssueCount(newLocalityId, 1L);
        } else if (isClosed(s)) {
            cityRepository.decrementResolvedIssueCount(oldCityId, 1L);
            localityRepository.decrementResolvedIssueCount(oldLocalityId, 1L);
            cityRepository.incrementResolvedIssueCount(newCityId, 1L);
            localityRepository.incrementResolvedIssueCount(newLocalityId, 1L);
        }
    }
}
package com.example.sih.service;

import com.example.sih.repository.CityRepository;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.repository.LocalityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecalculationService {
    private final IssueReportRepository repo;
    private final CityRepository cityRepo;
    private final LocalityRepository locRepo;
    private final DepartmentRepository depRepo;

    @Transactional
    public void recalcCities() {
        var rows = repo.aggregateCountsByCity();
        for(Object[] r: rows){
            Long cityId=(Long)r[0];
            Long active=(Long)r[1];
            Long resolved=(Long)r[2];
            Long currentA = cityRepo.getActiveIssueCount(cityId);
            Long currentR = cityRepo.getResolvedIssueCount(cityId);
            long deltaA = active-(currentA==null?0:currentA);
            long deltaR = resolved-(currentR==null?0:currentR);
            if(deltaA>0) cityRepo.incrementActiveIssueCount(cityId,deltaA);
            else if(deltaA<0) cityRepo.decrementActiveIssueCount(cityId,-deltaA);
            if(deltaR>0) cityRepo.incrementResolvedIssueCount(cityId,deltaR);
            else if(deltaR<0) cityRepo.decrementResolvedIssueCount(cityId,-deltaR);
        }
    }

    @Transactional
    public void recalcLocalities() {
        var rows = repo.aggregateCountsByLocality();
        for (Object[] r : rows) {
            Long localityId = (Long) r[0];
            Long active = (Long) r[1];
            Long resolved = (Long) r[2];
            Long currentA = locRepo.getActiveIssueCount(localityId);
            Long currentR = locRepo.getResolvedIssueCount(localityId);
            long deltaA = active - (currentA == null ? 0 : currentA);
            long deltaR = resolved - (currentR == null ? 0 : currentR);
            if (deltaA > 0) locRepo.incrementActiveIssueCount(localityId, deltaA);
            else if (deltaA < 0) locRepo.decrementActiveIssueCount(localityId, -deltaA);
            if (deltaR > 0) locRepo.incrementResolvedIssueCount(localityId, deltaR);
            else if (deltaR < 0) locRepo.decrementResolvedIssueCount(localityId, -deltaR);
        }
    }

    @Transactional
    public void recalcDepartments() {
        var rows = repo.aggregateCountsByDepartment();
        for (Object[] r : rows) {
            Long depId = (Long) r[0];
            Long active = (Long) r[1];
            Long resolved = (Long) r[2];
            Long currentA = depRepo.getActiveIssueCount(depId);
            Long currentR = depRepo.getResolvedIssueCount(depId);
            long deltaA = active - (currentA == null ? 0 : currentA);
            long deltaR = resolved - (currentR == null ? 0 : currentR);
            if (deltaA > 0) depRepo.incrementActiveIssueCount(depId, deltaA);
            else if (deltaA < 0) depRepo.decrementActiveIssueCount(depId, -deltaA);
            if (deltaR > 0) depRepo.incrementResolvedIssueCount(depId, deltaR);
            else if (deltaR < 0) depRepo.decrementResolvedIssueCount(depId, -deltaR);
        }
    }
}
package com.example.sih.service;

import com.example.sih.dto.CitySummary;
import com.example.sih.dto.CountSummary;
import com.example.sih.dto.DepartmentSummary;
import com.example.sih.dto.LeaderboardRow;
import com.example.sih.dto.LocalitySummary;
import com.example.sih.dto.Metric;
import com.example.sih.dto.TimeSeriesPoint;
import com.example.sih.entity.City;
import com.example.sih.entity.Department;
import com.example.sih.entity.Locality;
import com.example.sih.repository.CityRepository;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.repository.LocalityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final CityRepository cityRepo;
    private final LocalityRepository localityRepo;
    private final DepartmentRepository depRepo;
    private final IssueReportRepository issueRepo;

    @Transactional(readOnly = true)
    public List<LeaderboardRow> cityLeaderboard(Metric metric, int limit) {
        Comparator<LeaderboardRow> cmp;
        switch (metric) {
            case ACTIVE -> cmp = Comparator.comparingLong(LeaderboardRow::getActive).reversed();
            case RESOLVED -> cmp = Comparator.comparingLong(LeaderboardRow::getResolved).reversed();
            default -> cmp = Comparator.comparingLong(LeaderboardRow::getTotal).reversed();
        }
        return cityRepo.findAll().stream()
                .map(c -> new LeaderboardRow(c.getId(), c.getName(),
                        c.getActiveIssueCount(), c.getResolvedIssueCount()))
                .sorted(cmp)
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public CitySummary citySummary(Long cityId) {
        City c = cityRepo.findById(cityId).orElseThrow();
        long active = c.getActiveIssueCount();
        long resolved = c.getResolvedIssueCount();
        long total = active + resolved;
        Double avgHrs = null;
        Double rate = 0.0;
        Double avgSeconds = issueRepo.avgResolutionSecondsByCity(cityId);
        if (avgSeconds != null) avgHrs = avgSeconds / 3600.0;
        if (total > 0) rate = (resolved * 1.0 / total);
        return new CitySummary(c.getId(), c.getName(),
                new CountSummary(active, resolved), avgHrs, rate);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardRow> localityLeaderboard(Metric metric, int limit) {
        Comparator<LeaderboardRow> cmp;
        switch (metric) {
            case ACTIVE -> cmp = Comparator.comparingLong(LeaderboardRow::getActive).reversed();
            case RESOLVED -> cmp = Comparator.comparingLong(LeaderboardRow::getResolved).reversed();
            default -> cmp = Comparator.comparingLong(LeaderboardRow::getTotal).reversed();
        }
        return localityRepo.findAll().stream()
                .map(l -> new LeaderboardRow(l.getId(), l.getName(),
                        l.getActiveIssueCount(), l.getResolvedIssueCount()))
                .sorted(cmp)
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public LocalitySummary localitySummary(Long localityId) {
        Locality l = localityRepo.findById(localityId).orElseThrow();
        long active = l.getActiveIssueCount();
        long resolved = l.getResolvedIssueCount();
        long total = active + resolved;
        Double avgHrs = null;
        Double rate = 0.0;
        Double avgSeconds = issueRepo.avgResolutionSecondsByLocality(localityId);
        if (avgSeconds != null) avgHrs = avgSeconds / 3600.0;
        if (total > 0) rate = (resolved * 1.0 / total);
        return new LocalitySummary(l.getId(), l.getName(),
                new CountSummary(active, resolved), avgHrs, rate);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardRow> departmentLeaderboard(Metric metric, int limit) {
        Comparator<LeaderboardRow> cmp;
        switch (metric) {
            case ACTIVE -> cmp = Comparator.comparingLong(LeaderboardRow::getActive).reversed();
            case RESOLVED -> cmp = Comparator.comparingLong(LeaderboardRow::getResolved).reversed();
            default -> cmp = Comparator.comparingLong(LeaderboardRow::getTotal).reversed();
        }
        return depRepo.findAll().stream()
                .map(d -> new LeaderboardRow(d.getId(), d.getName(),
                        d.getActiveIssueCount(), d.getResolvedIssueCount()))
                .sorted(cmp)
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentSummary departmentSummary(Long departmentId) {
        Department d = depRepo.findById(departmentId).orElseThrow();
        long active = d.getActiveIssueCount();
        long resolved = d.getResolvedIssueCount();
        long total = active + resolved;
        Double avgHrs = null;
        Double rate = 0.0;
        Double avgSeconds = issueRepo.avgResolutionSecondsByDepartment(departmentId);
        if (avgSeconds != null) avgHrs = avgSeconds / 3600.0;
        if (total > 0) rate = (resolved * 1.0 / total);
        return new DepartmentSummary(d.getId(), d.getName(),
                new CountSummary(active, resolved), avgHrs, rate);
    }

    @Transactional(readOnly = true)
    public List<TimeSeriesPoint> getDailyNewIssues(Long cityId) {
        List<Object[]> raw = issueRepo.getDailyNewIssuesByCity(cityId);
        return raw.stream()
                .map(r -> new TimeSeriesPoint(
                        ((java.sql.Timestamp) r[0]).toLocalDateTime().toLocalDate(),
                        (Long) r[1]))
                .toList();
    }
}
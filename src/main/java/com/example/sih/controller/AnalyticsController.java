package com.example.sih.controller;

import com.example.sih.dto.*;
import com.example.sih.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService service;

    @GetMapping("/cities/leaderboard")
    public List<LeaderboardRow> cityLb(@RequestParam(defaultValue="TOTAL") Metric metric,
                                       @RequestParam(defaultValue="10") int limit){
        return service.cityLeaderboard(metric,limit);
    }

    @GetMapping("/cities/{id}/summary")
    public CitySummary summary(@PathVariable Long id){
        return service.citySummary(id);
    }

    @GetMapping("/localities/leaderboard")
    public List<LeaderboardRow> localityLb(@RequestParam(defaultValue = "TOTAL") Metric metric,
                                           @RequestParam(defaultValue = "10") int limit) {
        return service.localityLeaderboard(metric, limit);
    }

    @GetMapping("/localities/{id}/summary")
    public LocalitySummary localitySummary(@PathVariable Long id) {
        return service.localitySummary(id);
    }

    @GetMapping("/departments/leaderboard")
    public List<LeaderboardRow> departmentLb(@RequestParam(defaultValue = "TOTAL") Metric metric,
                                             @RequestParam(defaultValue = "10") int limit) {
        return service.departmentLeaderboard(metric, limit);
    }

    @GetMapping("/departments/{id}/summary")
    public DepartmentSummary departmentSummary(@PathVariable Long id) {
        return service.departmentSummary(id);
    }

    @GetMapping("/cities/{id}/timeseries/new-issues")
    public List<TimeSeriesPoint> dailyNewIssues(@PathVariable Long id) {
        return service.getDailyNewIssues(id);
    }
}
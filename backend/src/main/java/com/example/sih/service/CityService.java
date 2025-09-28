package com.example.sih.service;

import com.example.sih.entity.City;
import com.example.sih.repository.CityRepository;
import com.example.sih.repository.IssueReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepo;
    private final IssueReportRepository issueRepo;

    public City createCity(City city) {
        if (city.getIssueCount() == null) city.setIssueCount(0L);
        return cityRepo.save(city);
    }

    public List<City> getAllCities() {
        return cityRepo.findAll(Sort.by(Sort.Direction.DESC, "issueCount"));
    }

    public City getCityById(Long id) {
        return cityRepo.findById(id).orElseThrow(() -> new RuntimeException("City not found: " + id));
    }

    public List<City> searchCities(String keyword) {
        return cityRepo.findByNameContainingIgnoreCase(keyword);
    }

    public List<City> topCities(int limit) {
        return cityRepo.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "issueCount"))).getContent();
    }

    @Transactional
    public void incrementIssueCount(Long cityId, long delta) {
        cityRepo.incrementIssueCount(cityId, delta);
    }

    @Transactional
    public void recalcCityIssueCounts() {
        // Build a map of cityId -> count from IssueReport
        Map<Long, Long> counts = issueRepo.countGroupedByCity().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<City> cities = cityRepo.findAll();
        for (City c : cities) {
            long newCount = counts.getOrDefault(c.getId(), 0L);
            c.setIssueCount(newCount);
        }
        cityRepo.saveAll(cities);
    }
}
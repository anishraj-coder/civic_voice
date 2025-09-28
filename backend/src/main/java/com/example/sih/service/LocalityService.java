package com.example.sih.service;

import com.example.sih.entity.City;
import com.example.sih.entity.Locality;
import com.example.sih.repository.CityRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.repository.LocalityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocalityService {

    private final LocalityRepository localityRepo;
    private final CityRepository cityRepo;
    private final IssueReportRepository issueRepo;

    public Locality createLocality(Locality locality, Long cityId) {
        City city = cityRepo.findById(cityId).orElseThrow(() -> new RuntimeException("City not found: " + cityId));
        locality.setCity(city);
        if (locality.getIssueCount() == null) locality.setIssueCount(0L);
        return localityRepo.save(locality);
    }

    public List<Locality> getAllLocalities() {
        return localityRepo.findAll(Sort.by(Sort.Direction.DESC, "issueCount"));
    }

    public Locality getLocalityById(Long id) {
        return localityRepo.findById(id).orElseThrow(() -> new RuntimeException("Locality not found: " + id));
    }

    public List<Locality> getLocalitiesByCity(Long cityId) {
        return localityRepo.findByCityIdOrderByIssueCountDesc(cityId);
    }

    public List<Locality> searchLocalities(String keyword) {
        return localityRepo.findByNameContainingIgnoreCase(keyword);
    }

    public List<Locality> topLocalities(int limit) {
        return localityRepo.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "issueCount"))).getContent();
    }

    public List<Locality> topLocalitiesByCity(Long cityId, int limit) {
        return localityRepo.findByCityIdOrderByIssueCountDesc(cityId)
                .stream().limit(limit).toList();
    }

    @Transactional
    public void incrementIssueCount(Long localityId, long delta) {
        localityRepo.incrementIssueCount(localityId, delta);
    }

    @Transactional
    public void recalcLocalityIssueCounts() {
        Map<Long, Long> counts = issueRepo.countGroupedByLocality().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<Locality> localities = localityRepo.findAll();
        for (Locality l : localities) {
            long newCount = counts.getOrDefault(l.getId(), 0L);
            l.setIssueCount(newCount);
        }
        localityRepo.saveAll(localities);
    }
}
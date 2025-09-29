package com.example.sih.service;

import com.example.sih.entity.City;
import com.example.sih.entity.Locality;
import com.example.sih.repository.LocalityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalityService {
    private final LocalityRepository localityRepository;
    private final RecalculationService recalculationService;

    @Transactional
    public Locality createLocality(Locality locality) {
        return localityRepository.save(locality);
    }

    @Transactional(readOnly = true)
    public List<Locality> searchLocalities(String name) {
        return localityRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public List<Locality> getLocalitiesByCity(Long cityId) {
        City city = City.builder().id(cityId).build();
        return localityRepository.findByCity(city);
    }

    @Transactional(readOnly = true)
    public Locality getLocality(Long id) {
        return localityRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Locality not found"));
    }

    @Transactional
    public void deleteLocality(Long id) {
        localityRepository.deleteById(id);
    }

    @Transactional
    public void recalculateLocalityCounts() {
        recalculationService.recalcLocalities();
    }
}
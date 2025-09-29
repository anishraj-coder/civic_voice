package com.example.sih.service;

import com.example.sih.entity.City;
import com.example.sih.repository.CityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {
    private final CityRepository cityRepository;
    private final RecalculationService recalculationService;

    @Transactional
    public City createCity(City city) {
        return cityRepository.save(city);
    }

    @Transactional(readOnly = true)
    public List<City> searchCities(String name) {
        return cityRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public City getCity(Long id) {
        return cityRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("City not found"));
    }

    @Transactional
    public void deleteCity(Long id) {
        cityRepository.deleteById(id);
    }

    @Transactional
    public void recalculateCityCounts() {
        recalculationService.recalcCities();
    }
}
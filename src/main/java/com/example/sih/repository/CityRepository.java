package com.example.sih.repository;

import com.example.sih.entity.City;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findByNameContainingIgnoreCase(String name);

    List<City> findAllByOrderByIssueCountDesc();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update City c set c.issueCount = c.issueCount + :delta where c.id = :id")
    int incrementIssueCount(@Param("id") Long id, @Param("delta") long delta);
}
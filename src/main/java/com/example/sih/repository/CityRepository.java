package com.example.sih.repository;

import com.example.sih.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByNameContainingIgnoreCase(String name);
    List<City> findAllByOrderByActiveIssueCountDesc();
    List<City> findAllByOrderByResolvedIssueCountDesc();

    @Query("select c.activeIssueCount from City c where c.id = :id")
    Long getActiveIssueCount(Long id);

    @Query("select c.resolvedIssueCount from City c where c.id = :id")
    Long getResolvedIssueCount(Long id);

    @Modifying
    @Query("update City c set c.activeIssueCount = c.activeIssueCount + :delta where c.id = :id")
    int incrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update City c set c.activeIssueCount = c.activeIssueCount - :delta where c.id = :id")
    int decrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update City c set c.resolvedIssueCount = c.resolvedIssueCount + :delta where c.id = :id")
    int incrementResolvedIssueCount(Long id, long delta);

    @Modifying
    @Query("update City c set c.resolvedIssueCount = c.resolvedIssueCount - :delta where c.id = :id")
    int decrementResolvedIssueCount(Long id, long delta);
}
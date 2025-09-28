package com.example.sih.repository;

import com.example.sih.entity.City;
import com.example.sih.entity.Locality;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LocalityRepository extends JpaRepository<Locality, Long> {

    List<Locality> findByNameContainingIgnoreCase(String name);

    List<Locality> findByCity(City city);

    List<Locality> findByCityIdOrderByIssueCountDesc(Long cityId);

    List<Locality> findAllByOrderByIssueCountDesc();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Locality l set l.issueCount = l.issueCount + :delta where l.id = :id")
    int incrementIssueCount(@Param("id") Long id, @Param("delta") long delta);
}
package com.example.sih.repository;

import com.example.sih.entity.City;
import com.example.sih.entity.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LocalityRepository extends JpaRepository<Locality, Long> {
    List<Locality> findByNameContainingIgnoreCase(String name);
    List<Locality> findByCity(City city);
    List<Locality> findByCityIdOrderByActiveIssueCountDesc(Long cityId);
    List<Locality> findAllByOrderByActiveIssueCountDesc();
    List<Locality> findAllByOrderByResolvedIssueCountDesc();

    @Query("select l.activeIssueCount from Locality l where l.id = :id")
    Long getActiveIssueCount(Long id);

    @Query("select l.resolvedIssueCount from Locality l where l.id = :id")
    Long getResolvedIssueCount(Long id);

    @Modifying
    @Query("update Locality l set l.activeIssueCount = l.activeIssueCount + :delta where l.id = :id")
    int incrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update Locality l set l.activeIssueCount = l.activeIssueCount - :delta where l.id = :id")
    int decrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update Locality l set l.resolvedIssueCount = l.resolvedIssueCount + :delta where l.id = :id")
    int incrementResolvedIssueCount(Long id, long delta);

    @Modifying
    @Query("update Locality l set l.resolvedIssueCount = l.resolvedIssueCount - :delta where l.id = :id")
    int decrementResolvedIssueCount(Long id, long delta);
}
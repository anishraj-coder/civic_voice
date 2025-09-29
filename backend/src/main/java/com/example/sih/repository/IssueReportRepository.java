package com.example.sih.repository;

import com.example.sih.entity.City;
import com.example.sih.entity.IssueReport;
import com.example.sih.entity.Locality;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import org.springframework.data.jpa.repository.*;


import java.util.List;
import java.util.Optional;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {

    // Optimized queries with JOIN FETCH to solve N+1 problem
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department")
    List<IssueReport> findAllWithRelations();
    
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department WHERE ir.id = :id")
    Optional<IssueReport> findByIdWithRelations(Long id);
    
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department WHERE ir.status = :status")
    List<IssueReport> findByStatusWithRelations(Status status);
    
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department WHERE ir.category = :category")
    List<IssueReport> findByCategoryWithRelations(IssueCategory category);
    
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department WHERE ir.city.id = :cityId")
    List<IssueReport> findByCityIdWithRelations(Long cityId);
    
    @Query("SELECT ir FROM IssueReport ir LEFT JOIN FETCH ir.city LEFT JOIN FETCH ir.locality LEFT JOIN FETCH ir.department WHERE ir.locality.id = :localityId")
    List<IssueReport> findByLocalityIdWithRelations(Long localityId);

    // Original methods (keeping for compatibility)
    List<IssueReport> findByStatus(Status status);

    List<IssueReport> findByCategory(IssueCategory category);

    List<IssueReport> findByCity(City city);
    List<IssueReport> findByCityId(Long cityId);

    List<IssueReport> findByLocality(Locality locality);
    List<IssueReport> findByLocalityId(Long localityId);

    @Query("select ir.city.id as cityId, count(ir) as cnt from IssueReport ir group by ir.city.id")
    List<Object[]> countGroupedByCity();

    @Query("select ir.locality.id as localityId, count(ir) as cnt from IssueReport ir group by ir.locality.id")
    List<Object[]> countGroupedByLocality();
}
package com.example.sih.repository;

import com.example.sih.entity.City;
import com.example.sih.entity.IssueReport;
import com.example.sih.entity.Locality;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import org.springframework.data.jpa.repository.*;


import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {

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
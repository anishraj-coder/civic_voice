package com.example.sih.repository;

import com.example.sih.entity.City;
import com.example.sih.entity.IssueReport;
import com.example.sih.entity.Locality;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {

    // --- Simple finders ---
    List<IssueReport> findByStatus(Status status);
    List<IssueReport> findByCategory(IssueCategory category);
    List<IssueReport> findByCity(City city);
    List<IssueReport> findByLocality(Locality locality);

    long countByCityIdAndStatus(Long cityId, Status status);
    long countByLocalityIdAndStatus(Long localityId, Status status);

    // --- Aggregations ---
    @Query("select i.city.id, " +
            "sum(case when i.status in ('SUBMITTED','IN_PROGRESS') then 1 else 0 end), " +
            "sum(case when i.status in ('RESOLVED','REJECTED') then 1 else 0 end) " +
            "from IssueReport i group by i.city.id")
    List<Object[]> aggregateCountsByCity();

    @Query("select i.locality.id, " +
            "sum(case when i.status in ('SUBMITTED','IN_PROGRESS') then 1 else 0 end), " +
            "sum(case when i.status in ('RESOLVED','REJECTED') then 1 else 0 end) " +
            "from IssueReport i group by i.locality.id")
    List<Object[]> aggregateCountsByLocality();

    @Query("select i.department.id, " +
            "sum(case when i.status in ('SUBMITTED','IN_PROGRESS') then 1 else 0 end), " +
            "sum(case when i.status in ('RESOLVED','REJECTED') then 1 else 0 end) " +
            "from IssueReport i group by i.department.id")
    List<Object[]> aggregateCountsByDepartment();

    // --- Average Resolution Times ---
    // ✅ Switched to nativeQuery so PostgreSQL computes timestamp difference
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) " +
            "FROM issue_report " +
            "WHERE city_id = :cityId AND status = 'RESOLVED'",
            nativeQuery = true)
    Double avgResolutionSecondsByCity(@Param("cityId") Long cityId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) " +
            "FROM issue_report " +
            "WHERE locality_id = :localityId AND status = 'RESOLVED'",
            nativeQuery = true)
    Double avgResolutionSecondsByLocality(@Param("localityId") Long localityId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) " +
            "FROM issue_report " +
            "WHERE department_id = :departmentId AND status = 'RESOLVED'",
            nativeQuery = true)
    Double avgResolutionSecondsByDepartment(@Param("departmentId") Long departmentId);

    // --- Time series ---
    @Query(value = "SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) " +
            "FROM issue_report " +
            "WHERE city_id = :cityId " +
            "GROUP BY date ORDER BY date",
            nativeQuery = true)
    List<Object[]> getDailyNewIssuesByCity(@Param("cityId") Long cityId);
}
package com.example.sih.repository;

import com.example.sih.entity.Department;
import com.example.sih.types.IssueCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Department findByCategoryHandled(IssueCategory category);

    List<Department> findAllByOrderByActiveIssueCountDesc();
    List<Department> findAllByOrderByResolvedIssueCountDesc();

    @Query("select d.activeIssueCount from Department d where d.id = :id")
    Long getActiveIssueCount(Long id);

    @Query("select d.resolvedIssueCount from Department d where d.id = :id")
    Long getResolvedIssueCount(Long id);

    @Modifying
    @Query("update Department d set d.activeIssueCount = d.activeIssueCount + :delta where d.id = :id")
    int incrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update Department d set d.activeIssueCount = d.activeIssueCount - :delta where d.id = :id")
    int decrementActiveIssueCount(Long id, long delta);

    @Modifying
    @Query("update Department d set d.resolvedIssueCount = d.resolvedIssueCount + :delta where d.id = :id")
    int incrementResolvedIssueCount(Long id, long delta);

    @Modifying
    @Query("update Department d set d.resolvedIssueCount = d.resolvedIssueCount - :delta where d.id = :id")
    int decrementResolvedIssueCount(Long id, long delta);
}
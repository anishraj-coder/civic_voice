package com.example.sih;

import com.example.sih.entity.Department;
import com.example.sih.entity.IssueReport;
import com.example.sih.repository.DepartmentRepository;
import com.example.sih.repository.IssueReportRepository;
import com.example.sih.types.IssueCategory;
import com.example.sih.types.Status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class SihApplicationTests {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private IssueReportRepository issueReportRepository;

    @Test
    @Transactional  // rollback after test, keeps DB clean
    void testInsertAndOperations() {
        // 1️⃣ Insert a Department
        Department dept = Department.builder()
                .name("Road Maintenance")
                .categoryHandled(IssueCategory.ROADS)
                .build();

        Department savedDept = departmentRepository.save(dept);
        assertThat(savedDept.getId()).isNotNull();

        // 2️⃣ Insert an IssueReport assigned to that Department
        IssueReport issue = IssueReport.builder()
                .description("Large pothole near Bus Station")
                .latitude(40.7128)
                .longitude(-74.0060)
                .photoUrl("http://example.com/pothole.jpg")
                .category(IssueCategory.ROADS)
                .status(Status.SUBMITTED)
                .department(savedDept)
                .build();

        IssueReport savedIssue = issueReportRepository.save(issue);
        assertThat(savedIssue.getId()).isNotNull();
        assertThat(savedIssue.getDepartment().getId()).isEqualTo(savedDept.getId());

        // 3️⃣ Fetch issue by ID & verify
        IssueReport fetchedIssue = issueReportRepository.findById(savedIssue.getId())
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        assertThat(fetchedIssue.getDescription()).isEqualTo("Large pothole near Bus Station");

        // 4️⃣ Update status to IN_PROGRESS
        fetchedIssue.setStatus(Status.IN_PROGRESS);
        IssueReport updatedIssue = issueReportRepository.save(fetchedIssue);
        assertThat(updatedIssue.getStatus()).isEqualTo(Status.IN_PROGRESS);

        // 5️⃣ Query by Status
        List<IssueReport> inProgressIssues = issueReportRepository.findByStatus(Status.IN_PROGRESS);
        assertThat(inProgressIssues).isNotEmpty();

        // 6️⃣ Query by Category
        List<IssueReport> roadIssues = issueReportRepository.findByCategory(IssueCategory.ROADS);
        assertThat(roadIssues).isNotEmpty();

        // Print results for visual confirmation during hackathon demo
        System.out.println("✅ Department saved: " + savedDept);
        System.out.println("✅ Created Issue: " + savedIssue);
        System.out.println("✅ Updated Issue: " + updatedIssue);
        System.out.println("✅ Issues by status: " + inProgressIssues.size());
        System.out.println("✅ Issues by category: " + roadIssues.size());
    }
}
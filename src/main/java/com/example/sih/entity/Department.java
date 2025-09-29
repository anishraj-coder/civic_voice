package com.example.sih.entity;

import com.example.sih.types.IssueCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private IssueCategory categoryHandled;

    @Column(nullable = false)
    private Long activeIssueCount = 0L;

    @Column(nullable = false)
    private Long resolvedIssueCount = 0L;
}
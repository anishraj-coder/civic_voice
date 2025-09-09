package com.example.sih.entity;

import com.example.sih.types.IssueCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Department name cannot be blank")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueCategory categoryHandled;
}

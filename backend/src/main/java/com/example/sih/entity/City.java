package com.example.sih.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "City name cannot be blank")
    @Column(nullable = false, unique = true)
    private String name;
    private Long area;
    private Long population;
    @Column(nullable=false)
    private Long issueCount=0L;
}
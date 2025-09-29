package com.example.sih.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DepartmentSummary {
    private Long departmentId;
    private String departmentName;
    private CountSummary counts;
    private Double averageResolutionHours; // null if no RESOLVED issues
    private Double resolutionRate; // resolved / (active + resolved)
}
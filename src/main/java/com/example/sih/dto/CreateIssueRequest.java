package com.example.sih.dto;

import com.example.sih.types.IssueCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateIssueRequest {
    @NotBlank
    private String description;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String photoUrl;

    @NotNull
    private IssueCategory category;

    @NotNull
    private Long cityId;

    @NotNull
    private Long localityId;
}
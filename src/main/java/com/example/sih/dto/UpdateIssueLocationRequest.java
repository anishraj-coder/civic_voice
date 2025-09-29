package com.example.sih.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateIssueLocationRequest {
    @NotNull
    private Long cityId;

    @NotNull
    private Long localityId;
}
package com.example.sih.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class TimeSeriesPoint {
    private LocalDate date;
    private long count;
}
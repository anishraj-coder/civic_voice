package com.example.sih.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CountSummary {
    private long active;
    private long resolved;

    public long getTotal() {
        return active + resolved;
    }
}
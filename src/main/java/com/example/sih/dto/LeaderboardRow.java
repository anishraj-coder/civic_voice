package com.example.sih.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardRow {
    private Long id;
    private String name;
    private long active;
    private long resolved;

    public long getTotal() {
        return active + resolved;
    }
}
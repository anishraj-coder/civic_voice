package com.example.sih.controller;

import com.example.sih.dto.CreateIssueRequest;
import com.example.sih.dto.UpdateIssueLocationRequest;
import com.example.sih.entity.IssueReport;
import com.example.sih.service.IssueReportService;
import com.example.sih.types.Status;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueReportController {
    private final IssueReportService service;

    @PostMapping
    public IssueReport create(@Valid @RequestBody CreateIssueRequest req){
        return service.createIssue(req);
    }

    @PatchMapping("/{id}/status")
    public IssueReport status(@PathVariable Long id,@RequestParam Status status){
        return service.updateStatus(id,status);
    }

    @PatchMapping("/{id}/location")
    public IssueReport move(@PathVariable Long id,@Valid @RequestBody UpdateIssueLocationRequest req){
        return service.updateLocation(id,req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.deleteIssue(id);
    }
}
package com.aware.aware.controller;

import com.aware.aware.model.Report;
import com.aware.aware.repository.ReportRepository;
import com.aware.aware.util.HashUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;


    // ─── POST /api/reports ────────────────────────────────────────────────
    @PostMapping(consumes = "multipart/form-data")
    public Report createReport(
            @RequestParam("issueType")                              String issueType,
            @RequestParam("description")                            String description,
            @RequestParam(value = "location",       required=false) String location,
            @RequestParam(value = "submittedBy",    required=false) String submittedBy,
            @RequestParam(value = "submitterEmail", required=false) String submitterEmail,
            @RequestParam(value = "image",          required=false) MultipartFile image
    ) throws Exception {
        Report report = new Report();
        report.setIssueType(issueType);
        report.setDescription(description);
        report.setStatus(Report.ReportStatus.PENDING);

        if (location       != null && !location.isBlank())       report.setLocation(location);
        if (submittedBy    != null && !submittedBy.isBlank())     report.setSubmittedBy(submittedBy);
        if (submitterEmail != null && !submitterEmail.isBlank())  report.setSubmitterEmail(submitterEmail);
        if (image          != null && !image.isEmpty())           report.setImage(image.getBytes());

        List<Report> all = reportRepository.findAll();
        String previousHash = all.isEmpty() ? "0" : all.get(all.size() - 1).getHash();
        report.setPreviousHash(previousHash);
        report.setHash(HashUtil.generateHash(issueType + description + previousHash));

        return reportRepository.save(report);
    }

    // ─── GET /api/reports ─────────────────────────────────────────────────
    @GetMapping
    public List<Report> getAllReports() { return reportRepository.findAll(); }

    // ─── PATCH /api/reports/{id}/status ──────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Report> opt = reportRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String s = body.get("status");
        if (s == null) return ResponseEntity.badRequest().body("Missing 'status'");
        try {
            Report r = opt.get();
            r.setStatus(Report.ReportStatus.valueOf(s));
            reportRepository.save(r);
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + s);
        }
    }

    // ─── DELETE /api/reports/{id} ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOne(@PathVariable Long id) {
        if (!reportRepository.existsById(id)) return ResponseEntity.notFound().build();
        reportRepository.deleteById(id);
        return ResponseEntity.ok("Deleted " + id);
    }

    // ─── DELETE /api/reports/all ──────────────────────────────────────────
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAll() {
        reportRepository.deleteAll();
        return ResponseEntity.ok("All reports deleted.");
    }
}


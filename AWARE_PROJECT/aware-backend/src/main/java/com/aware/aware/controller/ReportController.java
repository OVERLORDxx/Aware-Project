package com.aware.aware.controller;

import com.aware.aware.model.Report;
import com.aware.aware.repository.ReportRepository;
import com.aware.aware.util.HashUtil;
import com.aware.aware.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
    public ResponseEntity<?> createReport(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("issueType")                              String issueType,
            @RequestParam("description")                            String description,
            @RequestParam(value = "location",       required=false) String location,
            @RequestParam(value = "submitterEmail", required=false) String submitterEmail,
            @RequestParam(value = "latitude",       required=false) Double latitude,
            @RequestParam(value = "longitude",      required=false) Double longitude,
            @RequestParam(value = "image",          required=false) MultipartFile image
    ) throws Exception {
        String username;
        try {
            username = JwtUtil.verifyTokenAndGetUsername(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing Authorization token");
        }

        Report report = new Report();
        report.setIssueType(issueType);
        report.setDescription(description);
        report.setStatus(Report.ReportStatus.PENDING);
        report.setSubmittedBy(username);

        if (location       != null && !location.isBlank())       report.setLocation(location);
        if (submitterEmail != null && !submitterEmail.isBlank())  report.setSubmitterEmail(submitterEmail);
        if (latitude       != null)                               report.setLatitude(latitude);
        if (longitude      != null)                               report.setLongitude(longitude);
        if (image          != null && !image.isEmpty())           report.setImage(image.getBytes());

        List<Report> all = reportRepository.findAll();
        String previousHash = all.isEmpty() ? "0" : all.get(all.size() - 1).getHash();
        report.setPreviousHash(previousHash);
        report.setHash(HashUtil.generateHash(issueType + description + previousHash));

        return ResponseEntity.ok(reportRepository.save(report));
    }

    // ─── GET /api/reports ─────────────────────────────────────────────────
    @GetMapping
    public List<Report> getAllReports() { 
        return reportRepository.findAll(); 
    }

    // ─── GET /api/reports/verify-chain ────────────────────────────────────
    @GetMapping("/verify-chain")
    public ResponseEntity<?> verifyChain() {
        List<Report> all = reportRepository.findAll();
        String expectedPrevHash = "0";

        for (Report r : all) {
            // Verify previous hash link
            if (!expectedPrevHash.equals(r.getPreviousHash())) {
                return ResponseEntity.ok(Map.of(
                    "status", "INVALID",
                    "message", "Chain broken at Report #" + r.getId() + "! Expected previousHash: " + expectedPrevHash + " but got: " + r.getPreviousHash(),
                    "failedReportId", r.getId()
                ));
            }

            // Verify current hash contents
            String recomputedHash = HashUtil.generateHash(r.getIssueType() + r.getDescription() + r.getPreviousHash());
            if (!recomputedHash.equals(r.getHash())) {
                return ResponseEntity.ok(Map.of(
                    "status", "INVALID",
                    "message", "Data integrity validation failed at Report #" + r.getId() + "! Stored hash does not match recomputed data hash.",
                    "failedReportId", r.getId()
                ));
            }

            expectedPrevHash = r.getHash();
        }

        return ResponseEntity.ok(Map.of(
            "status", "VALID",
            "message", "Hash chain verified. All " + all.size() + " records are cryptographically secure and intact."
        ));
    }

    // ─── PATCH /api/reports/{id}/status ──────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            JwtUtil.verifyAdminAndGetUsername(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }

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
    public ResponseEntity<String> deleteOne(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id
    ) {
        try {
            JwtUtil.verifyAdminAndGetUsername(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }

        if (!reportRepository.existsById(id)) return ResponseEntity.notFound().build();
        reportRepository.deleteById(id);
        return ResponseEntity.ok("Deleted " + id);
    }

    // ─── DELETE /api/reports/all ──────────────────────────────────────────
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAll(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            JwtUtil.verifyAdminAndGetUsername(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }

        reportRepository.deleteAll();
        return ResponseEntity.ok("All reports deleted.");
    }
}

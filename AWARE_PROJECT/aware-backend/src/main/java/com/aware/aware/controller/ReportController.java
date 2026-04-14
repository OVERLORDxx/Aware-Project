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

    private static final String HF_TOKEN = "Past_Your_Token";

    // WHY THESE MODELS:
    // microsoft/resnet-50 → Always warm on HF (millions of daily requests). Never cold starts.
    //                        Returns top-5 image classification labels with confidence scores.
    // google/vit-base-patch16-224 → Also always warm. Second opinion.
    // Both accept raw image bytes (no CORS, no JSON, simple binary POST).

    // ─── POST /api/reports ────────────────────────────────────────────────
    @PostMapping(consumes = "multipart/form-data")
    public Report createReport(
            @RequestParam("issueType")                              String issueType,
            @RequestParam("description")                            String description,
            @RequestParam(value = "location",       required=false) String location,
            @RequestParam(value = "aiLabel",        required=false) String aiLabel,
            @RequestParam(value = "submittedBy",    required=false) String submittedBy,
            @RequestParam(value = "submitterEmail", required=false) String submitterEmail,
            @RequestParam(value = "image",          required=false) MultipartFile image
    ) throws Exception {
        Report report = new Report();
        report.setIssueType(issueType);
        report.setDescription(description);
        report.setStatus(Report.ReportStatus.PENDING);

        if (location       != null && !location.isBlank())       report.setLocation(location);
        if (aiLabel        != null && !aiLabel.isBlank())         report.setAiLabel(aiLabel);
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

    // ─── POST /api/reports/analyze ────────────────────────────────────────
    @PostMapping("/analyze")
    public String analyzeImage(@RequestParam("file") MultipartFile file) {
        System.out.println("\n[AI] ===== NEW ANALYSIS REQUEST =====");
        System.out.println("[AI] File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
        System.out.println("[AI] Token: " + HF_TOKEN.substring(0, 12) + "...");

        String result = "";

        try {
            byte[] imageBytes = file.getBytes();

            // ── MODEL 1: microsoft/resnet-50 ─────────────────────────────
            // Always active — one of the most-used models on HF.
            // Returns: [{"label":"ashcan","score":0.91},{"label":"bucket","score":0.05},...]
            System.out.println("[AI] Trying Model 1: microsoft/resnet-50");
            String resnetResponse = postToHF(
                "https://api-inference.huggingface.co/models/microsoft/resnet-50",
                imageBytes
            );
            System.out.println("[AI] ResNet raw response: " + resnetResponse);

            if (resnetResponse != null && resnetResponse.contains("label")) {
                result = parseClassificationLabels(resnetResponse);
                System.out.println("[AI] ResNet parsed result: " + result);
            }

            // ── MODEL 2: google/vit-base-patch16-224 ─────────────────────
            // Also always active. Get a second opinion and combine.
            if (result.isEmpty()) {
                System.out.println("[AI] Model 1 gave nothing. Trying Model 2: google/vit-base-patch16-224");
                String vitResponse = postToHF(
                    "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
                    imageBytes
                );
                System.out.println("[AI] ViT raw response: " + vitResponse);

                if (vitResponse != null && vitResponse.contains("label")) {
                    result = parseClassificationLabels(vitResponse);
                    System.out.println("[AI] ViT parsed result: " + result);
                }
            }

        } catch (Exception e) {
            System.out.println("[AI] Exception: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            result = "Error: " + e.getMessage();
        }

        System.out.println("[AI] FINAL RESULT RETURNED TO REACT: '" + result + "'");
        System.out.println("[AI] ===== END =====\n");
        return result;
    }

    // ── POST image bytes to HF, return raw response string ───────────────
    // Creates a FRESH connection each call (no reuse bug).
    // Retries once if model returns 503 (loading).
    private String postToHF(String modelUrl, byte[] imageBytes) {
        System.out.println("[AI]   → Calling: " + modelUrl);
        return postToHFAttempt(modelUrl, imageBytes, true);
    }

    private String postToHFAttempt(String modelUrl, byte[] imageBytes, boolean allowRetry) {
        HttpURLConnection conn = null;
        try {
            // Always create a fresh connection
            URL url = new URL(modelUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + HF_TOKEN);
            conn.setRequestProperty("Content-Type", "application/octet-stream");
            conn.setDoOutput(true);
            conn.setConnectTimeout(15000); // 15 seconds
            conn.setReadTimeout(30000);    // 30 seconds

            // Write image
            OutputStream os = conn.getOutputStream();
            os.write(imageBytes);
            os.flush();
            os.close();

            int statusCode = conn.getResponseCode();
            System.out.println("[AI]   → HTTP Status: " + statusCode);

            if (statusCode == 200) {
                // SUCCESS — read and return the response
                String response = readStream(conn.getInputStream());
                System.out.println("[AI]   → Success! Response length: " + response.length() + " chars");
                return response;
            }

            if (statusCode == 503) {
                // Model is loading (cold start) — read the body to see estimated_time
                String errBody = readStream(conn.getErrorStream());
                System.out.println("[AI]   → 503 body: " + errBody);

                if (allowRetry) {
                    // Wait and retry once with a brand new connection
                    System.out.println("[AI]   → Waiting 8 seconds then retrying...");
                    Thread.sleep(8000);
                    return postToHFAttempt(modelUrl, imageBytes, false); // retry once
                }
                return null;
            }

            if (statusCode == 401) {
                System.out.println("[AI]   → 401 UNAUTHORIZED — token is wrong or expired!");
                System.out.println("[AI]   → Go to huggingface.co → Settings → Access Tokens → create new READ token");
                return null;
            }

            if (statusCode == 429) {
                System.out.println("[AI]   → 429 RATE LIMITED — too many requests, wait a minute");
                return null;
            }

            // Other error
            String errBody = conn.getErrorStream() != null ? readStream(conn.getErrorStream()) : "no body";
            System.out.println("[AI]   → Error " + statusCode + ": " + errBody);
            return null;

        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            System.out.println("[AI]   → Interrupted during sleep");
            return null;
        } catch (Exception e) {
            System.out.println("[AI]   → Exception: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return null;
        } finally {
            if (conn != null) {
                try { conn.disconnect(); } catch (Exception ignored) {}
            }
        }
    }

    // ── Read an InputStream fully into a String ───────────────────────────
    private String readStream(InputStream is) {
        if (is == null) return "";
        try {
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    // ── Parse classification response → readable string ───────────────────
    // Input:  [{"label":"ashcan","score":0.91},{"label":"bucket","score":0.05},...]
    // Output: "ashcan (91%), bucket (5%), ..."
    // Also does civic keyword mapping if found.
    private String parseClassificationLabels(String json) {
        if (json == null || json.isBlank()) return "";

        StringBuilder raw   = new StringBuilder(); // raw labels
        StringBuilder civic = new StringBuilder(); // mapped civic labels
        int searchFrom = 0;
        int count = 0;

        while (count < 5) {
            int labelIdx = json.indexOf("\"label\"", searchFrom);
            if (labelIdx < 0) break;

            // Extract label value
            int afterKey = labelIdx + 7; // skip "label"
            int colon = json.indexOf(":", afterKey);
            if (colon < 0) break;
            int openQ = json.indexOf("\"", colon);
            if (openQ < 0) break;
            int closeQ = json.indexOf("\"", openQ + 1);
            if (closeQ < 0) break;
            String label = json.substring(openQ + 1, closeQ).replace("_", " ").trim();

            // Extract score value (look for "score" after this label)
            String scoreStr = "?";
            int scoreIdx = json.indexOf("\"score\"", closeQ);
            if (scoreIdx >= 0 && scoreIdx < closeQ + 200) {
                int sc = json.indexOf(":", scoreIdx) + 1;
                while (sc < json.length() && json.charAt(sc) == ' ') sc++;
                int se = sc;
                while (se < json.length() && (Character.isDigit(json.charAt(se)) || json.charAt(se) == '.' || json.charAt(se) == '-')) se++;
                if (se > sc) {
                    try {
                        double score = Double.parseDouble(json.substring(sc, se));
                        scoreStr = Math.round(score * 100) + "%";
                    } catch (NumberFormatException ignored) {}
                }
            }

            if (count > 0) raw.append(", ");
            raw.append(label).append(" (").append(scoreStr).append(")");

            // Check if this label maps to a civic issue
            String mapped = mapLabelToCivic(label);
            if (mapped != null && civic.indexOf(mapped) < 0) {
                if (civic.length() > 0) civic.append(" + ");
                civic.append(mapped);
            }

            searchFrom = closeQ + 1;
            count++;
        }

        if (raw.length() == 0) return "";

        // Build the final string
        // If we found a civic match, show it prominently + raw labels
        // If no civic match, show raw labels (still real AI output)
        String rawStr = raw.toString();
        if (civic.length() > 0) {
            return civic + " | AI labels: " + rawStr;
        }
        return "AI detected: " + rawStr;
    }

    // ── Map ImageNet label → civic issue category ─────────────────────────
    private String mapLabelToCivic(String label) {
        if (label == null) return null;
        String t = label.toLowerCase();

        // Road / Pothole
        if (containsAny(t, "pothole","road","asphalt","pavement","street","highway","curb","gutter","traffic","intersection","lane"))
            return "Road Damage / Pothole";
        // Garbage
        if (containsAny(t, "garbage","trash","waste","litter","rubbish","dump","debris","refuse","ashcan","dustbin","bucket","barrel","can"))
            return "Garbage / Waste Issue";
        // Water
        if (containsAny(t, "water","flood","puddle","pipe","sewage","overflow","leak","drain","wet"))
            return "Water Leakage / Flooding";
        // Street light
        if (containsAny(t, "streetlight","street light","lamp","pole","lantern","torch","bulb","neon","spotlight"))
            return "Street Light Issue";
        // Drainage
        if (containsAny(t, "manhole","sewer","grate","culvert","storm drain"))
            return "Drainage Blockage";
        // Vegetation
        if (containsAny(t, "tree","branch","bush","weed","grass","plant","root","log","timber","jungle"))
            return "Vegetation / Tree Issue";

        return null; // no civic match — still return raw label
    }

    private boolean containsAny(String text, String... keywords) {
        for (String k : keywords) if (text.contains(k)) return true;
        return false;
    }
}

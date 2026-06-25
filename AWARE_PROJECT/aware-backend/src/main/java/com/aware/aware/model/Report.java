package com.aware.aware.model;

import jakarta.persistence.*;

@Entity
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String issueType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] image;

    private String hash;
    private String previousHash;

    @Column(columnDefinition = "TEXT")
    private String location;


    // ✅ Who submitted this report
    private String submittedBy;      // username
    private String submitterEmail;   // email

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    public enum ReportStatus { PENDING, IN_PROGRESS, COMPLETED, REJECTED }

    // ─── Getters & Setters ────────────────────────────────────────────────
    public Long   getId()                     { return id; }
    public String getIssueType()              { return issueType; }
    public void   setIssueType(String v)      { this.issueType = v; }
    public String getDescription()            { return description; }
    public void   setDescription(String v)    { this.description = v; }
    public byte[] getImage()                  { return image; }
    public void   setImage(byte[] v)          { this.image = v; }
    public String getHash()                   { return hash; }
    public void   setHash(String v)           { this.hash = v; }
    public String getPreviousHash()           { return previousHash; }
    public void   setPreviousHash(String v)   { this.previousHash = v; }
    public String getLocation()               { return location; }
    public void   setLocation(String v)       { this.location = v; }

    public String getSubmittedBy()            { return submittedBy; }
    public void   setSubmittedBy(String v)    { this.submittedBy = v; }
    public String getSubmitterEmail()         { return submitterEmail; }
    public void   setSubmitterEmail(String v) { this.submitterEmail = v; }
    public ReportStatus getStatus()           { return status; }
    public void   setStatus(ReportStatus v)   { this.status = v; }
}

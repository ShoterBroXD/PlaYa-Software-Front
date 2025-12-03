package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "report")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idreport")
    private Long idReport;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "idsong")
    private Song song;

    @ManyToOne
    @JoinColumn(name = "idcomment")
    private Comment comment;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(name = "report_date", nullable = false)
    private LocalDateTime reportDate;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    public enum ReportStatus {
        PENDING,
        RESOLVED,
        DISMISSED
    }
}
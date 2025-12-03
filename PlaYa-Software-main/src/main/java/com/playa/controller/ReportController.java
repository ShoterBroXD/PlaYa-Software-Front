package com.playa.controller;

import com.playa.model.Report;
import com.playa.service.CommentService;
import com.playa.service.PlaylistService;
import com.playa.service.ReportService;
import com.playa.service.SongService;
import com.playa.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final CommentService commentService;
    private final SongService songService;
    private final PlaylistService playlistService;
    private final UserService userService;
    private final ReportService reportService;

    // POST /reports/content - Reportar contenido inadecuado (US-014)
    @PostMapping("/content")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reportContent(
            @RequestHeader("idUser") Long idUser,
            @RequestBody Map<String, Object> reportData) {

        String contentType = (String) reportData.get("contentType");
        String reason = (String) reportData.get("reason");
        String description = (String) reportData.get("description");

        // Validar que se proporcione el motivo del reporte
        if (reason == null || reason.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Debes indicar el motivo del reporte");
            errorResponse.put("message", "El campo 'reason' es obligatorio");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Validar tipo de contenido
        if (contentType == null || contentType.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Tipo de contenido no especificado");
            errorResponse.put("message", "Debes especificar el tipo de contenido a reportar");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            Report report;
            Long contentId = Long.valueOf(reportData.get("contentId").toString());

            if ("SONG".equalsIgnoreCase(contentType)) {
                report = reportService.reportSong(contentId, idUser, reason, description);
            } else if ("COMMENT".equalsIgnoreCase(contentType)) {
                report = reportService.reportComment(contentId, idUser, reason, description);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Tipo de contenido no soportado");
                errorResponse.put("message", "Solo se pueden reportar canciones y comentarios");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("reportId", report.getIdReport());
            response.put("reporterId", idUser);
            response.put("contentType", contentType);
            response.put("contentId", contentId);
            response.put("reason", reason);
            response.put("description", description);
            response.put("status", report.getStatus().toString());
            response.put("reportDate", report.getReportDate().toString());
            response.put("message", "Reporte enviado exitosamente. Será revisado por moderación.");

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", "No se pudo procesar el reporte");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // GET /reports - Obtener todos los reportes (Solo ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllReports() {
        List<Report> reports = reportService.getAllReports();
        List<Map<String, Object>> response = reports.stream().map(report -> {
            Map<String, Object> reportMap = new HashMap<>();
            reportMap.put("reportId", report.getIdReport());
            reportMap.put("reporterId", report.getReporter().getIdUser());
            reportMap.put("reporterName", report.getReporter().getName());
            reportMap.put("contentType", report.getSong() != null ? "SONG" : "COMMENT");
            reportMap.put("contentId", report.getSong() != null ? report.getSong().getIdSong() : report.getComment().getIdComment());
            reportMap.put("reason", report.getReason());
            reportMap.put("description", report.getDescription());
            reportMap.put("status", report.getStatus().toString());
            reportMap.put("reportDate", report.getReportDate().toString());
            if (report.getReviewedDate() != null) {
                reportMap.put("reviewedDate", report.getReviewedDate().toString());
                reportMap.put("reviewedBy", report.getReviewedBy().getName());
                reportMap.put("reviewNotes", report.getReviewNotes());
            }
            return reportMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // GET /reports/pending - Obtener reportes pendientes (Solo ADMIN)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingReports() {
        List<Report> pendingReports = reportService.getPendingReports();
        List<Map<String, Object>> response = pendingReports.stream().map(report -> {
            Map<String, Object> reportMap = new HashMap<>();
            reportMap.put("reportId", report.getIdReport());
            reportMap.put("reporterId", report.getReporter().getIdUser());
            reportMap.put("reporterName", report.getReporter().getName());
            reportMap.put("contentType", report.getSong() != null ? "SONG" : "COMMENT");
            reportMap.put("contentId", report.getSong() != null ? report.getSong().getIdSong() : report.getComment().getIdComment());
            reportMap.put("reason", report.getReason());
            reportMap.put("description", report.getDescription());
            reportMap.put("status", report.getStatus().toString());
            reportMap.put("reportDate", report.getReportDate().toString());
            reportMap.put("priority", "HIGH"); // Podría calcularse basado en cantidad de reportes
            return reportMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // PUT /reports/{id}/resolve - Resolver reporte (Solo ADMIN)
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> resolveReport(
            @PathVariable Long id,
            @RequestHeader("idUser") Long adminId,
            @RequestParam String action,
            @RequestParam(required = false) String reviewNotes) {

        try {
            Report.ReportStatus status;
            if ("APPROVE".equals(action)) {
                status = Report.ReportStatus.RESOLVED;
            } else if ("REJECT".equals(action)) {
                status = Report.ReportStatus.DISMISSED;
            } else {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Acción no válida. Use 'APPROVE' o 'REJECT'")
                );
            }

            Report resolvedReport = reportService.reviewReport(id, adminId, status, reviewNotes);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Reporte #" + id + " " + (status == Report.ReportStatus.RESOLVED ? "resuelto" : "rechazado") + " exitosamente");
            response.put("action", status == Report.ReportStatus.RESOLVED ? "CONTENT_HIDDEN" : "NO_ACTION");
            response.put("reportId", id.toString());
            response.put("status", status.toString());
            response.put("resolvedDate", resolvedReport.getReviewedDate().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al resolver el reporte");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // GET /reports/user/{userId} - Obtener reportes de un usuario (Solo el usuario o ADMIN)
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getReportsByUser(@PathVariable Long userId) {
        // Verificar que el usuario existe
        userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Map<String, Object>> userReports = new ArrayList<>();

        // Simulando reportes del usuario
        Map<String, Object> report = new HashMap<>();
        report.put("reportId", 3L);
        report.put("reporterId", userId);
        report.put("contentType", "PLAYLIST");
        report.put("contentId", 2L);
        report.put("reason", "Contenido inapropiado");
        report.put("status", "PENDING");
        report.put("reportDate", "2024-11-07T12:00:00");
        userReports.add(report);

        return ResponseEntity.ok(userReports);
    }

    // GET /reports/statistics - Obtener estadísticas de reportes (Solo ADMIN)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getReportStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReports", 150);
        stats.put("pendingReports", 12);
        stats.put("resolvedReports", 138);
        stats.put("reportsByType", Map.of(
                "SONG", 85,
                "COMMENT", 45,
                "PLAYLIST", 20
        ));
        stats.put("reportsByReason", Map.of(
                "Contenido ofensivo", 60,
                "Spam", 35,
                "Violencia", 25,
                "Otros", 30
        ));

        return ResponseEntity.ok(stats);
    }
}

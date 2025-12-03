package com.playa.service;

import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Report;
import com.playa.model.Song;
import com.playa.model.User;
import com.playa.model.Comment;
import com.playa.repository.ReportRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    public Report reportSong(Long songId, Long userId, String reason) {
        return reportSong(songId, userId, reason, null);
    }

    public Report reportSong(Long songId, Long userId, String reason, String description) {
        // Validar motivo del reporte
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Debes indicar el motivo del reporte");
        }

        // Validar que la canción existe
        Song song = validateSongExists(songId);

        // Validar que el usuario existe
        User user = validateUserExists(userId);

        // Validar que el usuario no está reportando su propia canción
        if (song.getUser().getIdUser().equals(userId)) {
            throw new IllegalArgumentException("No puedes reportar tu propia canción");
        }

        // Crear y guardar el reporte
        Report report = Report.builder()
                .reporter(user)
                .song(song)
                .reason(reason)
                .description(description)
                .status(Report.ReportStatus.PENDING)
                .reportDate(LocalDateTime.now())
                .build();

        return reportRepository.save(report);
    }

    public Report reportComment(Long commentId, Long userId, String reason, String description) {
        // Validar motivo del reporte
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Debes indicar el motivo del reporte");
        }

        // Validar que el comentario existe
        Comment comment = validateCommentExists(commentId);

        // Validar que el usuario existe
        User user = validateUserExists(userId);

        // Validar que el usuario no está reportando su propio comentario
        if (comment.getIdUser().equals(userId)) {
            throw new IllegalArgumentException("No puedes reportar tu propio comentario");
        }

        // Crear y guardar el reporte
        Report report = Report.builder()
                .reporter(user)
                .comment(comment)
                .reason(reason)
                .description(description)
                .status(Report.ReportStatus.PENDING)
                .reportDate(LocalDateTime.now())
                .build();

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatus(Report.ReportStatus.PENDING);
    }

    public Report reviewReport(Long reportId, Long adminId, Report.ReportStatus status, String reviewNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado"));

        User admin = validateUserExists(adminId);

        report.setStatus(status);
        report.setReviewedBy(admin);
        report.setReviewedDate(LocalDateTime.now());
        report.setReviewNotes(reviewNotes);

        return reportRepository.save(report);
    }

    public Song validateSongExists(Long songId) {
        Optional<Song> songOptional = songRepository.findById(songId);
        if (songOptional.isEmpty()) {
            throw new ResourceNotFoundException("Canción no encontrada con ID: " + songId);
        }
        return songOptional.get();
    }

    public User validateUserExists(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + userId);
        }
        return userOptional.get();
    }

    public Comment validateCommentExists(Long commentId) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            throw new ResourceNotFoundException("Comentario no encontrado con ID: " + commentId);
        }
        return commentOptional.get();
    }

    public Long countUserSongs(Long userId) {
        User user = validateUserExists(userId);
        return songRepository.countByUserAndVisibilityNot(user, "deleted");
    }

    public List<Comment> getSongComments(Long songId) {
        validateSongExists(songId);
        return commentRepository.findBySong_IdSongOrderByDateDesc(songId);
    }

    public boolean isValidReportReason(String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            return false;
        }

        String[] validReasons = {
            "Discurso de odio",
            "Contenido sexual",
            "Violencia",
            "Spam",
            "Derechos de autor"
        };

        for (String validReason : validReasons) {
            if (validReason.equals(reason)) {
                return true;
            }
        }
        return false;
    }

    public String createReportStructure(Long userId, Long songId, String reason) {
        validateUserExists(userId);
        validateSongExists(songId);

        if (!isValidReportReason(reason)) {
            throw new IllegalArgumentException("Motivo de reporte no válido");
        }

        return "Reporte creado exitosamente para canción " + songId + " por usuario " + userId + " con motivo: " + reason;
    }
}

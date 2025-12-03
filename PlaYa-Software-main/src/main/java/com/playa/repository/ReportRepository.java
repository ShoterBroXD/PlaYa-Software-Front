package com.playa.repository;

import com.playa.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // Buscar reportes por estado
    List<Report> findByStatus(Report.ReportStatus status);

    // Buscar reportes por canción
    List<Report> findBySong_IdSong(Long idSong);

    // Buscar reportes por comentario
    List<Report> findByComment_IdComment(Long idComment);

    // Buscar reportes realizados por un usuario
    List<Report> findByReporter_IdUser(Long idUser);

    // Buscar reportes revisados por un admin
    List<Report> findByReviewedBy_IdUser(Long idUser);
}


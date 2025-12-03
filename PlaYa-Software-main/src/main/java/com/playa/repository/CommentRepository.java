package com.playa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.playa.model.Comment;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Métodos personalizados si los necesitas

    // Buscar comentarios por canción
    List<Comment> findBySong_IdSongOrderByDateAsc(Long idSong);

    // Buscar comentarios por canción ordenados por fecha descendente
    List<Comment> findBySong_IdSongOrderByDateDesc(Long idSong);

    // Buscar comentarios por usuario
    List<Comment> findByIdUser(Long idUser);

    // Buscar respuestas a un comentario
    List<Comment> findByParentComment(Long parentComment);
}

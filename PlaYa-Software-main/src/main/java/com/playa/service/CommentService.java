package com.playa.service;

import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.CommentMapper;
import com.playa.model.Song;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.playa.repository.CommentRepository;
import com.playa.dto.CommentRequestDto;
import com.playa.dto.CommentResponseDto;
import com.playa.model.Comment;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import com.playa.repository.UserRepository;
import com.playa.repository.SongRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final CommentMapper commentMapper;


    @Transactional
    public CommentResponseDto createComment(Long idUser, CommentRequestDto dto) {
        // Validar que los campos requeridos no sean nulos
        if (idUser == null || dto.getIdSong() == null || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Los campos idUser, idSong y content son obligatorios");
        }

        // Validar que el usuario existe
        if (!userRepository.existsById(idUser)) {
            throw new ResourceNotFoundException("El usuario con ID " + idUser + " no existe");
        }

        // Validar que la canción existe
        if (!songRepository.existsById(dto.getIdSong())) {
            throw new ResourceNotFoundException("La canción con ID " + dto.getIdSong() + " no existe");
        }

        // Validar el comentario padre si existe
        if (dto.getParentComment() != null && !commentRepository.existsById(dto.getParentComment())) {
            throw new ResourceNotFoundException("El comentario padre con ID " + dto.getParentComment() + " no existe");
        }

        Song song = songRepository.findById(dto.getIdSong()).
                orElseThrow(()-> new RuntimeException("Cancion no encontrada"));
        Comment comment = new Comment();
        comment.setIdUser(idUser);
        comment.setSong(song);
        comment.setContent(dto.getContent().trim());
        comment.setParentComment(dto.getParentComment());
        comment.setVisible(true); // Inicializar como visible por defecto
        comment.setDate(LocalDateTime.now());

        Comment saved = commentRepository.save(comment);
        return commentMapper.convertToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getAllComments() {
        List<Comment> comments = commentRepository.findAll();
        return comments.stream()
                .filter(comment -> comment.getVisible()) // Filtrar solo comentarios visibles
                .map(commentMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsBySong(Long songId) {
        List<Comment> comments = commentRepository.findBySong_IdSongOrderByDateDesc(songId);
        return comments.stream()
                .filter(comment -> comment.getVisible()) // Filtrar solo comentarios visibles
                .map(commentMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommentResponseDto getComment(Long id) {
        return commentRepository.findById(id)
            .map(commentMapper::convertToResponseDto)
                .orElseThrow(()-> new ResourceNotFoundException("El comentario no existe"));
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("El comentario no existe"));
         commentRepository.delete(comment);
    }

    @Transactional
    public void reportComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El comentario no existe"));
        comment.setVisible(false);
        commentRepository.save(comment);
    }

    @Transactional
    public void unreportComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El comentario no existe"));
        comment.setVisible(true);
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public boolean isCommentOwner(Long commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("El comentario no existe"));

        // Buscar el usuario por email
        return userRepository.findByEmail(userEmail)
                .map(user -> user.getIdUser().equals(comment.getIdUser()))
                .orElse(false);
    }

}
package com.playa.controller;

import com.playa.service.CommentService;
import com.playa.dto.CommentRequestDto;
import com.playa.dto.CommentResponseDto;
import com.playa.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.playa.repository.UserRepository;
import com.playa.model.User;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/comments")
public class CommentController {
    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    // GET /api/v1/comments - Obtener todos los comentarios (Solo admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommentResponseDto>> getAllComments() {
        List<CommentResponseDto> comments = commentService.getAllComments();
        if (comments.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(comments); // 200
    }

    // POST /api/v1/comments - Crear comentario (Requiere autenticación)
    @PostMapping
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<CommentResponseDto> createComment(@RequestBody CommentRequestDto dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        
        CommentResponseDto response = commentService.createComment(user.getIdUser(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/comments/{id} - Obtener comentario (público)
    @GetMapping("/{id}")
    public ResponseEntity<CommentResponseDto> getComment(@PathVariable Long id) {
        try {
            CommentResponseDto response = commentService.getComment(id);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build(); // 404 es correcto aquí - recurso específico no encontrado
        }
    }

    // GET /api/v1/comments/song/{songId} - Obtener comentarios de una canción (público)
    @GetMapping("/song/{songId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsBySong(@PathVariable Long songId) {
        List<CommentResponseDto> comments = commentService.getCommentsBySong(songId);
        if (comments.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(comments); // 200
    }

    // POST /api/v1/comments/{id}/report - Reportar/ocultar comentario (Solo admin)
    @PostMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> reportComment(@PathVariable Long id) {
        commentService.reportComment(id);
        return ResponseEntity.ok("Comentario reportado y ocultado exitosamente");
    }

    // POST /api/v1/comments/{id}/unreport - Mostrar comentario reportado (Solo admin)
    @PostMapping("/{id}/unreport")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> unreportComment(@PathVariable Long id) {
        commentService.unreportComment(id);
        return ResponseEntity.ok("Comentario habilitado exitosamente");
    }

    // DELETE /api/v1/comments/{id} - Eliminar comentario (Solo propietario o admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}

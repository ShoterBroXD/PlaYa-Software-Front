package com.playa.controller;

import com.playa.dto.CommentResponseDto;
import com.playa.dto.RateSongRequestDto;
import com.playa.dto.SongRequestDto;
import com.playa.dto.SongResponseDto;
import com.playa.service.CommentService;
import com.playa.service.SongService;
import com.playa.repository.UserRepository;
import com.playa.model.User;
import com.playa.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;
    private final CommentService commentService;
    private final UserRepository userRepository; // nuevo para resolver usuario autenticado

    // POST /api/v1/songs - Subir canción (Solo artistas)
    @PostMapping
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<SongResponseDto> createSong(@Valid @RequestBody SongRequestDto requestDto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        
        SongResponseDto responseDto = songService.createSong(user.getIdUser(), requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // GET /api/v1/songs/{id} - Consultar detalles canción
    @GetMapping("/{id}")
    public ResponseEntity<SongResponseDto> getSongById(@PathVariable Long id) {
        SongResponseDto responseDto = songService.getSongById(id);
        return ResponseEntity.ok(responseDto);
    }

    // PUT /api/v1/songs/{id} - Actualizar canción (Solo propietario o admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<SongResponseDto> updateSong(
            @PathVariable Long id,
            @Valid @RequestBody SongRequestDto requestDto) {
            SongResponseDto responseDto = songService.updateSong(id, requestDto);
            return ResponseEntity.ok(responseDto);
    }

    // DELETE /api/v1/songs/{id} - Eliminar canción (Solo propietario o admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteSong(@PathVariable Long id) {
            songService.deleteSong(id);
            return ResponseEntity.ok("Canción eliminada exitosamente");
    }

    @GetMapping("/{idsong}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable Long idsong) {
        List<CommentResponseDto> comments = songService.getAllComments(idsong);
        return ResponseEntity.ok(comments);
    }

    // GET /api/v1/songs/user/{userId} - Obtener canciones de un usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SongResponseDto>> getSongsByUser(@PathVariable Long userId) {
        List<SongResponseDto> songs = songService.getSongsByUser(userId);
        if (songs.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(songs); // 200
    }

    // GET /api/v1/songs - Obtener todas las canciones públicas
    @GetMapping("/public")
    public ResponseEntity<List<SongResponseDto>> getPublicSongs() {
        List<SongResponseDto> songs = songService.getPublicSongs();
        if (songs.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(songs); // 200
    }

    // POST /api/v1/songs/{id}/report - Reportar/ocultar canción (Solo admin)
    @PostMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> reportSong(@PathVariable Long id) {
        songService.reportSong(id);
        return ResponseEntity.ok("Canción reportada y ocultada exitosamente");
    }

    // POST /api/v1/songs/{id}/unreport - Mostrar canción reportada (Solo admin)
    @PostMapping("/{id}/unreport")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> unreportSong(@PathVariable Long id) {
        songService.unreportSong(id);
        return ResponseEntity.ok("Canción habilitada exitosamente");
    }

    // POST /api/v1/songs/{id}/rate - Calificar canción (ahora toma usuario del token)
    @PostMapping("/{id}/rate")
    public ResponseEntity<SongResponseDto> rateSong(
            @PathVariable Long id,
            @Valid @RequestBody RateSongRequestDto request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        SongResponseDto responseDto = songService.rateSong(id, user.getIdUser(), request.getRating());
        return ResponseEntity.ok(responseDto);
    }
}

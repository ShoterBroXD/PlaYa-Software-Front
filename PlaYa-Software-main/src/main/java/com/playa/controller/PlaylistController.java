package com.playa.controller;

import com.playa.dto.AddSongToPlaylistDto;
import com.playa.dto.PlaylistRequestDto;
import com.playa.dto.PlaylistResponseDto;
import com.playa.repository.UserRepository;
import com.playa.model.User;
import com.playa.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;
    private final UserRepository userRepository;

    // POST /api/v1/playlists - Crear playlist (US-013)
    @PostMapping
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<PlaylistResponseDto> createPlaylist(@Valid @RequestBody PlaylistRequestDto requestDto) {
        PlaylistResponseDto responseDto = playlistService.createPlaylist(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // GET /api/v1/playlists/{id} - Obtener playlist (Solo propietario, admin o si es pública)
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistResponseDto> getPlaylistById(@PathVariable Long id) {
        PlaylistResponseDto responseDto = playlistService.getPlaylistById(id);
        return ResponseEntity.ok(responseDto);
    }

    // POST /api/v1/playlists/{id}/songs - Agregar canción a playlist (Solo propietario)
    @PostMapping("/{id}/songs")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<String> addSongToPlaylist(
            @PathVariable Long id,
            @Valid @RequestBody AddSongToPlaylistDto requestDto) {
        playlistService.addSongToPlaylist(id, requestDto);
        return ResponseEntity.ok("Canción agregada a la playlist exitosamente");
    }

    // POST /api/v1/playlists/{id}/songs/bulk - Agregar múltiples canciones a playlist
    @PostMapping("/{id}/songs/bulk")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<String> addSongsToPlaylist(
            @PathVariable Long id,
            @Valid @RequestBody com.playa.dto.AddSongsToPlaylistDto requestDto) {
        playlistService.addSongsToPlaylist(id, requestDto);
        return ResponseEntity.ok("Canciones agregadas a la playlist exitosamente");
    }

    // DELETE /api/v1/playlists/{id}/songs/{songId} - Quitar canción de playlist (Solo propietario)
    @DeleteMapping("/{id}/songs/{songId}")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<String> removeSongFromPlaylist(
            @PathVariable Long id,
            @PathVariable Long songId) {
        playlistService.removeSongFromPlaylist(id, songId);
        return ResponseEntity.ok("Canción removida de la playlist exitosamente");
    }

    // GET /api/v1/playlists - Obtener todas las playlists públicas
    @GetMapping
    public ResponseEntity<List<PlaylistResponseDto>> getAllPlaylists() {
        List<PlaylistResponseDto> playlists = playlistService.getAllPlaylists();
        if (playlists.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(playlists); // 200
    }

    // GET /api/v1/playlists/user/{userId} - Obtener playlists de un usuario (Solo propietario o admin)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlaylistResponseDto>> getPlaylistsByUser(@PathVariable Long userId, Authentication authentication) {
        // Allow admins or the user themself
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!isAdmin) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            Long principalId = user != null ? user.getIdUser() : null;
            if (principalId == null || !principalId.equals(userId)) {
                throw new AccessDeniedException("No autorizado para ver estas playlists");
            }
        }

        List<PlaylistResponseDto> playlists = playlistService.getPlaylistsByUser(userId);
        if (playlists.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(playlists); // 200
    }

    // POST /api/v1/playlists/{id}/report - Reportar/ocultar playlist (Solo admin)
    @PostMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> reportPlaylist(@PathVariable Long id) {
        playlistService.reportPlaylist(id);
        return ResponseEntity.ok("Playlist reportada y ocultada exitosamente");
    }

    // POST /api/v1/playlists/{id}/unreport - Mostrar playlist reportada (Solo admin)
    @PostMapping("/{id}/unreport")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> unreportPlaylist(@PathVariable Long id) {
        playlistService.unreportPlaylist(id);
        return ResponseEntity.ok("Playlist habilitada exitosamente");
    }

    // DELETE /api/v1/playlists/{id} - Eliminar playlist (Solo propietario o admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<String> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.ok("Playlist eliminada exitosamente");
    }
}

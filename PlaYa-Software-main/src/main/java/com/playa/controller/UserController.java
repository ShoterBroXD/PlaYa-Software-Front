package com.playa.controller;

import com.playa.dto.*;
import com.playa.model.enums.Rol;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.playa.service.UserService;
import com.playa.dto.UpdateLanguageRequest;
import com.playa.dto.UpdatePrivacyRequest;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // GET /api/v1/users - Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(users); // 200
    }
    
    // POST /api/v1/users - Registrar nuevo usuario
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserRequestDto user) {
        UserResponseDto createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }
    
    // GET /api/v1/users/{id} - Consultar perfil de usuario
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // PUT /api/v1/users/{id} - Actualizar perfil
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody UserRequestDto userDetails) {
        try {
            UserResponseDto updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DELETE /api/v1/users/{id} - Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/artists/filter")
    //@PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> filterArtists(
            @RequestParam(required = false) Rol role,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long idgenre) {

        Rol rol = role != null ? role : Rol.ARTIST;
        List<UserResponseDto> result = userService.filterArtists(rol, name, idgenre);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/genre/{idgenre}")
    public ResponseEntity<List<UserResponseDto>> getAllByIdGenre(@PathVariable Long idgenre) {
        List<UserResponseDto> users = userService.findAllByIdGenre(idgenre);
        return ResponseEntity.ok(users);
    }

    // PUT /api/v1/users/{id}/preferences - Actualizar preferencias musicales (funcionanalidad premium)
    @PutMapping("/{id}/preferences")
    @PreAuthorize("(hasRole('LISTENER') or hasRole('ARTIST')) and #id == authentication.principal.userId")
    public ResponseEntity<?> updatePreferences(@PathVariable Long id, @RequestBody UserPreferencesDto preferencesDto) {
        List<String> genres = preferencesDto.getFavoriteGenres();
        if (genres == null || genres.isEmpty()) {
            return ResponseEntity.badRequest().body("Debes seleccionar al menos una preferencia");
        }
        if (genres.size() > 5) {
            return ResponseEntity.badRequest().body("Solo puedes seleccionar hasta 5 géneros favoritos");
        }
        userService.updateUserPreferences(id, genres);
        return ResponseEntity.ok("Preferencias actualizadas correctamente");
    }

    // POST /api/v1/users/{id}/preferences/reset - Reiniciar preferencias musicales
    @PostMapping("/{id}/preferences/reset")
    @PreAuthorize("(hasRole('LISTENER') or hasRole('ARTIST')) and #id == authentication.principal.userId")
    public ResponseEntity<?> resetPreferences(@PathVariable Long id) {
        userService.resetUserPreferences(id);
        return ResponseEntity.ok("Preferencias reiniciadas. Recibirás recomendaciones desde cero");
    }

    @GetMapping("/nuevos")
    public ResponseEntity<List<UserResponseDto>> getNewArtists(Rol role) {
        List<UserResponseDto> users = userService.getNewArtists();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(users);
    }

    // GET /api/v1/users/emerging - Artistas emergentes (nuevos o con pocos seguidores)
    @GetMapping("/emerging")
    //@PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getEmergingArtists(
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        List<UserResponseDto> artists = userService.getEmergingArtists(limit);
        if (artists.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(artists);
    }

    // GET /api/v1/users/active-artists - Artistas que han subido música recientemente
    @GetMapping("/active-artists")
    //@PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getActiveArtists(
            @RequestParam(required = false, defaultValue = "30") Integer days,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        List<UserResponseDto> artists = userService.getActiveArtists(days, limit);
        if (artists.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(artists);
    }

    // GET /api/v1/users/needs-support - Artistas sin reproducciones que necesitan apoyo
    @GetMapping("/needs-support")
    //@PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getArtistsWithoutPlays(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        List<UserResponseDto> artists = userService.getArtistsWithoutPlays(limit);
        if (artists.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(artists);
    }

    // GET /api/v1/users/discover-diverse - Descubre artistas de géneros diversos
    @GetMapping("/discover-diverse")
    //@PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getArtistsByGenreDiversity(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        List<UserResponseDto> artists = userService.getArtistsByGenreDiversity(userId, limit);
        if (artists.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(artists);
    }

    @PutMapping("/{id}/settings/language")
    public ResponseEntity<?> updateLanguage(@PathVariable Long id, @RequestBody UpdateLanguageRequest request) {
        userService.updateUserLanguage(id, request.getLanguage());
        return ResponseEntity.ok("Idioma actualizado correctamente");
    }

    @PutMapping("/{id}/settings/privacy")
    public ResponseEntity<?> updatePrivacy(@PathVariable Long id, @RequestBody UpdatePrivacyRequest request) {
        userService.updateUserHistoryVisibility(id, request.getHistoryVisible());
        return ResponseEntity.ok("Configuración de privacidad actualizada correctamente");
    }
}
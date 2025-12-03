package com.playa.controller;

import com.playa.dto.*;
import com.playa.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    // POST /api/v1/social/share - Compartir canción en redes sociales (Solo usuarios autenticados)
    @PostMapping("/share")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<SocialShareResponseDto> shareSong(
            @RequestHeader("iduser") Long idUser,
            @Valid @RequestBody SocialShareRequestDto requestDto) {

        SocialShareResponseDto response = socialService.shareSong(idUser, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/social/shares - Obtener comparticiones del usuario (Solo propietario o admin)
    @GetMapping("/shares")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<SocialShareResponseDto>> getUserShares(@RequestHeader("iduser") Long idUser) {
        List<SocialShareResponseDto> shares = socialService.getUserShares(idUser);
        if (shares.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(shares); // 200
    }

    // GET /api/v1/social/shares/song/{songId} - Obtener comparticiones de una canción (Público)
    @GetMapping("/shares/song/{songId}")
    public ResponseEntity<List<SocialShareResponseDto>> getSongShares(@PathVariable Long songId) {
        List<SocialShareResponseDto> shares = socialService.getSongShares(songId);
        if (shares.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(shares); // 200
    }

    // GET /api/v1/social/shares/count/{songId} - Obtener contador de comparticiones de una canción (Público)
    @GetMapping("/shares/count/{songId}")
    public ResponseEntity<Long> getSongShareCount(@PathVariable Long songId) {
        Long count = socialService.getSongShareCount(songId);
        return ResponseEntity.ok(count);
    }

    // PUT /api/v1/social/profile - Actualizar perfil de redes sociales (Solo propietario)
    @PutMapping("/profile")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateSocialProfile(
            @RequestHeader("iduser") Long idUser,
            @Valid @RequestBody SocialProfileRequestDto requestDto) {

        UserResponseDto response = socialService.updateSocialProfiles(idUser, requestDto);
        return ResponseEntity.ok(response);
    }

    // POST /api/v1/social/connect - Vincular red social con credenciales (Solo artistas)
    @PostMapping("/connect")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> connectSocialNetwork(
            @RequestHeader("iduser") Long idUser,
            @Valid @RequestBody SocialConnectRequestDto requestDto) {

        try {
            SocialConnectResponseDto response = socialService.connectSocialNetwork(idUser, requestDto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ingrese las credenciales correctas"));
        }
    }

    // GET /api/v1/social/can-share - Verificar si el usuario puede compartir (Solo usuario autenticado)
    @GetMapping("/can-share")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> canUserShare(@RequestHeader("iduser") Long idUser) {
        Boolean canShare = socialService.canUserShare(idUser);
        return ResponseEntity.ok(canShare);
    }

    // GET /api/v1/social/shares/user/{userId} - Obtener comparticiones de otro usuario (Solo admin)
    @GetMapping("/shares/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SocialShareResponseDto>> getOtherUserShares(@PathVariable Long userId) {
        List<SocialShareResponseDto> shares = socialService.getUserShares(userId);
        if (shares.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(shares); // 200
    }

    // GET /api/v1/social/share-link/{songId} - Generar enlace de compartir con metadatos (Público)
    @GetMapping("/share-link/{songId}")
    public ResponseEntity<SongShareLinkDto> generateShareLink(@PathVariable Long songId) {
        SongShareLinkDto shareLink = socialService.generateShareLink(songId);
        return ResponseEntity.ok(shareLink);
    }
}



package com.playa.controller;

import com.playa.dto.NotificationPreferenceRequestDto;
import com.playa.dto.NotificationPreferenceResponseDto;
import com.playa.dto.NotificationRequestDto;
import com.playa.dto.NotificationResponseDto;
import com.playa.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // POST /notifications - Crear notificación
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(@Valid @RequestBody NotificationRequestDto requestDto) {
        NotificationResponseDto responseDto = notificationService.createNotification(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // GET /notifications - Listar notificaciones de usuario
    @GetMapping
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByUser(@RequestHeader Long idUser, @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly) {
        List<NotificationResponseDto> notifications = notificationService.getUserNotifications(idUser, unreadOnly);
        return ResponseEntity.ok(notifications);
    }

    // PUT /notifications/{id} - Marcar como leída
    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponseDto> markAsRead(@RequestHeader("idUser") Long iduser,@PathVariable Long id) {
        notificationService.markAsRead(id,iduser);
        return ResponseEntity.ok().build();
    }

    // GET /notifications/{idUser}/unread - Obtener notificaciones no leídas
    @GetMapping("/{idUser}/unread")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotificationsByUser(@PathVariable Long idUser) {
        List<NotificationResponseDto> notifications = notificationService.getUnreadNotificationsByUser(idUser);
        return ResponseEntity.ok(notifications);
    }

    // GET /notifications/{idUser}/count - Obtener cantidad de notificaciones no leídas
    @GetMapping("/{idUser}/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long idUser) {
        long count = notificationService.getUnreadCount(idUser);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/preferences")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<NotificationPreferenceResponseDto> getPreferences(@RequestHeader("idUser") Long idUser) {
        NotificationPreferenceResponseDto preferences = notificationService.getPreferences(idUser);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("idUser") Long idUser) {
        notificationService.markAllAsRead(idUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences/edit")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Void> updatePreferences(@RequestHeader("idUser") Long idUser,@RequestBody NotificationPreferenceRequestDto request) {
        notificationService.setpreferences(idUser, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Void> togglePreferences(@RequestHeader("idUser") Long idUser) {
        notificationService.togglePreferences(idUser);
        return ResponseEntity.ok().build();
    }

    // DELETE /notifications/{id} - Eliminar notificación
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notificación eliminada exitosamente");
    }
}

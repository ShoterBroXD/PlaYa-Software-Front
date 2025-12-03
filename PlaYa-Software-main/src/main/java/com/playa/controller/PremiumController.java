package com.playa.controller;

import com.playa.dto.UserRequestDto;
import com.playa.dto.UserResponseDto;
import com.playa.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/premium")
@RequiredArgsConstructor
public class PremiumController {

    private final com.playa.security.JwtUtil jwtUtil;
    private final UserService userService;

    // POST /premium/subscribe - Suscribirse a premium (US-020)
    @PostMapping("/subscribe")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<Map<String, Object>> subscribeToPremium(
            @RequestHeader("idUser") Long idUser,
            @RequestBody Map<String, Object> subscriptionData) {

        // Validar método de pago
        String paymentMethod = (String) subscriptionData.get("paymentMethod");
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Método de pago inválido");
            errorResponse.put("message", "Debes proporcionar un método de pago válido");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Simular procesamiento de suscripción
        userService.updatePremiumStatus(idUser, true);
        
        // Obtener usuario actualizado para generar nuevo token
        UserResponseDto user = userService.getUserById(idUser)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Generar nuevo token
        String newToken = jwtUtil.generateToken(user.getEmail(), user.getName(), user.getIdUser(), user.getType());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", idUser);
        response.put("status", "ACTIVE");
        response.put("planType", subscriptionData.getOrDefault("planType", "MONTHLY"));
        response.put("message", "Suscripción premium activada exitosamente");
        response.put("token", newToken); // Devolver nuevo token
        response.put("benefits", new String[]{
                "Escucha sin anuncios",
                "Descarga canciones para offline",
                "Calidad de audio superior",
                "Playlists ilimitadas",
                "Soporte prioritario"
        });

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /premium/status/{userId} - Verificar estado de suscripción premium
    @GetMapping("/status/{userId}")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPremiumStatus(@PathVariable Long userId) {
        // Verificar que el usuario existe
        UserResponseDto user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("isPremium", user.getPremium());
        response.put("planType", "MONTHLY");
        response.put("status", user.getPremium() ? "ACTIVE" : "INACTIVE");
        response.put("renewalDate", "2024-12-07");

        return ResponseEntity.ok(response);
    }

    // PUT /premium/cancel/{userId} - Cancelar suscripción premium
    @PutMapping("/cancel/{userId}")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cancelPremiumSubscription(@PathVariable Long userId) {
        // Verificar que el usuario existe
        userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        userService.updatePremiumStatus(userId, false);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Suscripción premium cancelada exitosamente");
        response.put("status", "CANCELLED");
        response.put("effectiveDate", "2024-11-07");

        return ResponseEntity.ok(response);
    }

    // POST /premium/renew/{userId} - Renovar suscripción premium
    @PostMapping("/renew/{userId}")
    @PreAuthorize("hasRole('LISTENER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> renewPremiumSubscription(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> renewalData) {

        // Validar método de pago
        String paymentMethod = (String) renewalData.get("paymentMethod");
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Método de pago inválido");
            errorResponse.put("message", "Debes proporcionar un método de pago válido para renovar");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("status", "RENEWED");
        response.put("planType", renewalData.getOrDefault("planType", "MONTHLY"));
        response.put("message", "Suscripción renovada exitosamente");
        response.put("newExpiryDate", "2024-12-07");

        return ResponseEntity.ok(response);
    }

    // GET /premium/benefits - Obtener beneficios premium disponibles
    @GetMapping("/benefits")
    public ResponseEntity<Map<String, Object>> getPremiumBenefits() {
        Map<String, Object> response = new HashMap<>();
        response.put("benefits", new String[]{
                "Escucha sin anuncios",
                "Descarga canciones para offline",
                "Calidad de audio superior",
                "Playlists ilimitadas",
                "Soporte prioritario",
                "Apoya a artistas independientes"
        });
        response.put("pricing", Map.of(
                "monthly", "$9.99/mes",
                "yearly", "$99.99/año"
        ));
        return ResponseEntity.ok(response);
    }
}

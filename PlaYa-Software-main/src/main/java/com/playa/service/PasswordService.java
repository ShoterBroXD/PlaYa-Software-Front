package com.playa.service;

import com.playa.dto.PasswordChangeRequestDto;
import com.playa.dto.PasswordResetRequestDto;
import com.playa.dto.NotificationRequestDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.PasswordResetToken;
import com.playa.model.User;
import com.playa.repository.PasswordResetTokenRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final NotificationService notificationService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public void changePassword(PasswordChangeRequestDto request){
        // Obtener el usuario autenticado del contexto de seguridad
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())){
            throw new RuntimeException("Credenciales no coinciden intentelo de nuevo");
        }
        if(!request.getNewPassword().equals(request.getConfirmNewPassword())){
            throw new RuntimeException("La contraseña de este campo debe de coincidir con la nueva contraseña");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Crear notificación de confirmación de cambio de contraseña
        NotificationRequestDto notification = NotificationRequestDto.builder()
                .idUser(user.getIdUser())
                .content("Tu contraseña ha sido cambiada correctamente.")
                .read(false)
                .type("SYSTEM")
                .date(LocalDateTime.now())
                .build();
        notificationService.createNotification(notification);
    }

    @Transactional
    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        tokenRepository.deleteByUser(user);

        // Crear un nuevo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expirationDate(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(resetToken);
        return token;
    }

    @Transactional
    public void resetPassword(String token, PasswordResetRequestDto request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        if (resetToken == null) {
            throw new ResourceNotFoundException("Token inválido");
        }
        if (resetToken.isExpired()) {
            throw new RuntimeException("El token ha expirado");
        }

        User user = resetToken.getUser();
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("La contraseña de este campo debe de coincidir con la nueva contraseña");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Crear notificación de confirmación de reseteo de contraseña
        NotificationRequestDto resetNotification = NotificationRequestDto.builder()
                .idUser(user.getIdUser())
                .content("Tu contraseña ha sido restablecida correctamente.")
                .read(false)
                .type("SYSTEM")
                .date(LocalDateTime.now())
                .build();
        notificationService.createNotification(resetNotification);

        tokenRepository.delete(resetToken);
    }
}

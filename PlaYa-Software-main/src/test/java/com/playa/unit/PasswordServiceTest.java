package com.playa.unit;

import com.playa.dto.PasswordChangeRequestDto;
import com.playa.dto.PasswordResetRequestDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.PasswordResetToken;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import com.playa.repository.PasswordResetTokenRepository;
import com.playa.repository.UserRepository;
import com.playa.service.PasswordService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordService - Pruebas Unitarias - US-018: Recuperar/Cambiar contraseña")
class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private com.playa.service.NotificationService notificationService;

    @InjectMocks
    private PasswordService passwordService;

    private User testUser;
    private PasswordResetToken validToken;
    private PasswordResetToken expiredToken;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();

        // Usuario de prueba
        testUser = User.builder()
                .idUser(1L)
                .name("Test User")
                .email("test@example.com")
                .password(passwordEncoder.encode("oldPassword123")) // Contraseña encriptada
                .type(Rol.LISTENER)
                .registerDate(LocalDateTime.now())
                .premium(false)
                .active(true)
                .build();

        // Token válido
        validToken = PasswordResetToken.builder()
                .idtoken(1L)
                .token("valid-token-123")
                .user(testUser)
                .expirationDate(LocalDateTime.now().plusMinutes(10)) // Expira en 10 minutos
                .build();

        // Token expirado
        expiredToken = PasswordResetToken.builder()
                .idtoken(2L)
                .token("expired-token-456")
                .user(testUser)
                .expirationDate(LocalDateTime.now().minusMinutes(10)) // Expiró hace 10 minutos
                .build();
    }

    private void setupAuthentication(String email) {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
    }


    @Test
    @DisplayName("US-018 - Escenario 01: Debe generar y enviar enlace de recuperación cuando el correo existe")
    void generateResetToken_whenEmailExists_returnsToken() {
        // Given que seleccionó "Olvidé mi contraseña"
        String email = "test@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        doNothing().when(tokenRepository).deleteByUser(testUser);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String token = passwordService.generateResetToken(email);

        assertNotNull(token, "El token no debe ser nulo");
        assertFalse(token.isEmpty(), "El token no debe estar vacío");

        verify(tokenRepository, times(1)).deleteByUser(testUser);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository, times(1)).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertEquals(testUser, savedToken.getUser(), "El token debe estar asociado al usuario correcto");
        assertNotNull(savedToken.getExpirationDate(), "El token debe tener fecha de expiración");
        assertTrue(savedToken.getExpirationDate().isAfter(LocalDateTime.now()),
                "El token debe expirar en el futuro (15 minutos desde ahora)");

        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    @DisplayName("US-018 - Escenario 02: Debe actualizar contraseña cuando el token es válido")
    void resetPassword_whenTokenValidAndPasswordsMatch_updatesPassword() {
        // Given que recibo el enlace (token válido)
        String token = "valid-token-123";
        String newPassword = "newSecurePassword123";
        PasswordResetRequestDto request = PasswordResetRequestDto.builder()
                .newPassword(newPassword)
                .confirmNewPassword(newPassword)
                .build();

        when(tokenRepository.findByToken(token)).thenReturn(validToken);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(tokenRepository).delete(validToken);
        when(notificationService.createNotification(any())).thenReturn(null);

        passwordService.resetPassword(token, request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertNotEquals(newPassword, savedUser.getPassword(),
                "La contraseña NO debe estar en texto plano");
        assertTrue(savedUser.getPassword().startsWith("$2a$") || savedUser.getPassword().startsWith("$2b$"),
                "La contraseña debe estar encriptada con BCrypt");
        assertTrue(passwordEncoder.matches(newPassword, savedUser.getPassword()),
                "La contraseña encriptada debe coincidir con la nueva contraseña");

        verify(tokenRepository, times(1)).delete(validToken);
        verify(tokenRepository, times(1)).findByToken(token);
    }

    @Test
    @DisplayName("US-018 - Escenario 03: Debe mostrar error cuando el correo no está registrado")
    void generateResetToken_whenEmailNotExists_throwsException() {
        String nonExistentEmail = "noexiste@example.com";

        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> passwordService.generateResetToken(nonExistentEmail),
                "Debe lanzar ResourceNotFoundException cuando el correo no existe"
        );

        assertEquals("Usuario no encontrado", exception.getMessage(),
                "El mensaje de error debe indicar que el usuario no fue encontrado");

        verify(userRepository, times(1)).findByEmail(nonExistentEmail);
        verify(tokenRepository, never()).deleteByUser(any(User.class));
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Debe rechazar contraseña cuando el token es inválido")
    void resetPassword_whenTokenInvalid_throwsException() {
        // Arrange
        String invalidToken = "invalid-token-xyz";
        PasswordResetRequestDto request = PasswordResetRequestDto.builder()
                .newPassword("newPassword123")
                .confirmNewPassword("newPassword123")
                .build();

        when(tokenRepository.findByToken(invalidToken)).thenReturn(null);

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> passwordService.resetPassword(invalidToken, request),
                "Debe lanzar excepción cuando el token es inválido"
        );

        assertEquals("Token inválido", exception.getMessage());
        verify(tokenRepository, times(1)).findByToken(invalidToken);
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Debe rechazar contraseña cuando el token está expirado")
    void resetPassword_whenTokenExpired_throwsException() {
        String token = "expired-token-456";
        PasswordResetRequestDto request = PasswordResetRequestDto.builder()
                .newPassword("newPassword123")
                .confirmNewPassword("newPassword123")
                .build();

        when(tokenRepository.findByToken(token)).thenReturn(expiredToken);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> passwordService.resetPassword(token, request),
                "Debe lanzar excepción cuando el token está expirado"
        );

        assertEquals("El token ha expirado", exception.getMessage());
        verify(tokenRepository, times(1)).findByToken(token);
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Debe rechazar contraseña cuando las contraseñas no coinciden")
    void resetPassword_whenPasswordsDoNotMatch_throwsException() {
        String token = "valid-token-123";
        PasswordResetRequestDto request = PasswordResetRequestDto.builder()
                .newPassword("newPassword123")
                .confirmNewPassword("differentPassword456")
                .build();

        when(tokenRepository.findByToken(token)).thenReturn(validToken);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> passwordService.resetPassword(token, request),
                "Debe lanzar excepción cuando las contraseñas no coinciden"
        );

        assertEquals("La contraseña de este campo debe de coincidir con la nueva contraseña",
                exception.getMessage());
        verify(tokenRepository, times(1)).findByToken(token);
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Debe cambiar contraseña correctamente cuando las credenciales son válidas")
    void changePassword_whenCredentialsValid_changesPassword() {
        String email = "test@example.com";
        String newPassword = "newSecurePassword456";
        PasswordChangeRequestDto request = PasswordChangeRequestDto.builder()
                .currentPassword("oldPassword123")
                .newPassword(newPassword)
                .confirmNewPassword(newPassword)
                .build();

        setupAuthentication(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(notificationService.createNotification(any())).thenReturn(null);

        passwordService.changePassword(request);

        verify(userRepository, times(1)).findByEmail(email);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertNotEquals(newPassword, savedUser.getPassword(),
                "La contraseña NO debe estar en texto plano");
        assertTrue(savedUser.getPassword().startsWith("$2a$") || savedUser.getPassword().startsWith("$2b$"),
                "La contraseña debe estar encriptada con BCrypt");
        assertTrue(passwordEncoder.matches(newPassword, savedUser.getPassword()),
                "La contraseña encriptada debe coincidir con la nueva contraseña");
    }

    @Test
    @DisplayName("Debe rechazar cambio cuando la contraseña actual es incorrecta")
    void changePassword_whenCurrentPasswordIncorrect_throwsException() {
        String email = "test@example.com";
        PasswordChangeRequestDto request = PasswordChangeRequestDto.builder()
                .currentPassword("wrongPassword")
                .newPassword("newPassword123")
                .confirmNewPassword("newPassword123")
                .build();

        setupAuthentication(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> passwordService.changePassword(request)
        );

        assertEquals("Credenciales no coinciden intentelo de nuevo", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe rechazar cambio cuando las nuevas contraseñas no coinciden")
    void changePassword_whenNewPasswordsDoNotMatch_throwsException() {
        // Arrange
        String email = "test@example.com";
        PasswordChangeRequestDto request = PasswordChangeRequestDto.builder()
                .currentPassword("oldPassword123")
                .newPassword("newPassword123")
                .confirmNewPassword("differentPassword456")
                .build();

        setupAuthentication(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> passwordService.changePassword(request)
        );

        assertEquals("La contraseña de este campo debe de coincidir con la nueva contraseña",
                exception.getMessage());
        verify(userRepository, times(1)).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el usuario no existe al cambiar contraseña")
    void changePassword_whenUserNotFound_throwsException() {
        String EmailMal = "noexiste@example.com";
        PasswordChangeRequestDto request = PasswordChangeRequestDto.builder()
                .currentPassword("oldPassword")
                .newPassword("newPassword123")
                .confirmNewPassword("newPassword123")
                .build();

        setupAuthentication(EmailMal);
        when(userRepository.findByEmail(EmailMal)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> passwordService.changePassword(request)
        );

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(EmailMal);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe eliminar tokens antiguos antes de generar uno nuevo")
    void generateResetToken_whenCalled_deletesOldTokens() {
        String email = "test@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        doNothing().when(tokenRepository).deleteByUser(testUser);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        passwordService.generateResetToken(email);

        verify(tokenRepository, times(1)).deleteByUser(testUser);
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
    }
}


package com.playa.unit;

import com.playa.dto.request.LoginRequest;
import com.playa.dto.request.RegisterRequest;
import com.playa.dto.response.AuthResponse;
import com.playa.exception.DuplicateEmailException;
import com.playa.model.Role;
import com.playa.model.RoleType;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import com.playa.repository.RoleRepository;
import com.playa.repository.UserRepository;
import com.playa.security.JwtUtil;
import com.playa.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Pruebas Unitarias US-015")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = new Role();
        userRole.setId(1L);
        userRole.setName(RoleType.ROLE_USER);
    }

    private User createMockUser(Long id, String email, String name, Rol type) {
        return User.builder()
                .idUser(id)
                .email(email)
                .password("encodedPassword")
                .name(name)
                .type(type)
                .role(userRole)
                .registerDate(LocalDateTime.now())
                .premium(false)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("CP-041: Registrar nueva cuenta")
    void register_ValidListenerData_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
                "test_listener@mail.com",
                "claveSegura123",
                "Test Listener",
                Rol.LISTENER
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(roleRepository.findByName(RoleType.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");

        User savedUser = createMockUser(1L, "test_listener@mail.com", "Test Listener", Rol.LISTENER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken("test_listener@mail.com", "Test Listener", 1L, Rol.LISTENER)).thenReturn("fake-jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.email()).isEqualTo("test_listener@mail.com");
        assertThat(response.name()).isEqualTo("Test Listener");

        verify(userRepository).existsByEmail("test_listener@mail.com");
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("claveSegura123");
    }

    @Test
    @DisplayName("CP-042: Cuenta ya registrada")
    void register_DuplicateEmail_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
                "usuario.existente@mail.com",
                "password123",
                "Usuario Duplicado",
                Rol.LISTENER
        );
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("El correo ya está registrado");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("CP-043: Credenciales incorrectas")
    void login_InvalidCredentials_ThrowsException() {
        // Arrange
        LoginRequest request = new LoginRequest("usuario@valido.com", "contraseñaincorrecta");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class)
                .hasMessageContaining("Bad credentials");

        verify(userRepository, never()).findByEmail(anyString());
    }
}

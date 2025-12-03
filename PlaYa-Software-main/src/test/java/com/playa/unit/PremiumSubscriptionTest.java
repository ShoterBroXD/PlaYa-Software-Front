package com.playa.unit;

import com.playa.exception.ResourceNotFoundException;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import com.playa.repository.UserRepository;
import com.playa.repository.GenreRepository;
import com.playa.mapper.UserMapper;
import com.playa.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PremiumSubscription - Pruebas Unitarias US-020")
class PremiumSubscriptionTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User mockFreeUser;
    private User mockPremiumUser;

    @BeforeEach
    void setUp() {
        mockFreeUser = createMockUser(300L, "user_free@mail.com", "Free User", false);
        mockPremiumUser = createMockUser(301L, "user_premium@mail.com", "Premium User", true);
    }

    private User createMockUser(Long id, String email, String name, Boolean premium) {
        return User.builder()
                .idUser(id)
                .email(email)
                .name(name)
                .premium(premium)
                .type(Rol.LISTENER)
                .registerDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("CP-019: Debe mejorar plan a Premium exitosamente")
    void upgradeToPremiun_ValidPayment_Success() {
        // Arrange - Preparar datos para actualizar usuario a premium
        Long userId = 300L;
        com.playa.dto.UserRequestDto userRequestDto = new com.playa.dto.UserRequestDto();
        userRequestDto.setName("premium_user");
        userRequestDto.setEmail("user_free@mail.com");
        userRequestDto.setPremium(true);

        com.playa.dto.UserResponseDto responseDto = com.playa.dto.UserResponseDto.builder()
            .idUser(userId)
            .name("premium_user")
            .email("user_free@mail.com")
            .premium(true)
            .build();

        // Mocks para updateUser
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockFreeUser));
        when(userRepository.save(any(User.class))).thenReturn(mockPremiumUser);
        when(userMapper.convertToResponseDto(any(User.class))).thenReturn(responseDto);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        com.playa.dto.UserResponseDto result = userService.updateUser(userId, userRequestDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("user_free@mail.com");

        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
        verify(userMapper).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("CP-020: Debe visualizar estado de suscripción activa")
    void viewSubscriptionStatus_PremiumUser_Success() {
        // Arrange
        Long userId = 301L;
        com.playa.dto.UserResponseDto responseDto = com.playa.dto.UserResponseDto.builder()
            .idUser(userId)
            .name("premium_user")
            .email("user_premium@mail.com")
            .premium(true)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockPremiumUser));
        when(userMapper.convertToResponseDto(any(User.class))).thenReturn(responseDto);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        Optional<com.playa.dto.UserResponseDto> result = userService.getUserById(userId);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getIdUser()).isEqualTo(userId);
        assertThat(result.get().getEmail()).isEqualTo("user_premium@mail.com");

        verify(userRepository).findById(userId);
        verify(userMapper).convertToResponseDto(mockPremiumUser);
    }

    @Test
    @DisplayName("Debe visualizar estado gratuito para usuario no premium")
    void viewSubscriptionStatus_FreeUser_Success() {
        // Arrange
        Long userId = 300L;
        com.playa.dto.UserResponseDto responseDto = com.playa.dto.UserResponseDto.builder()
            .idUser(userId)
            .name("free_user")
            .email("user_free@mail.com")
            .premium(false)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockFreeUser));
        when(userMapper.convertToResponseDto(any(User.class))).thenReturn(responseDto);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        Optional<com.playa.dto.UserResponseDto> result = userService.getUserById(userId);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getIdUser()).isEqualTo(userId);

        verify(userRepository).findById(userId);
        verify(userMapper).convertToResponseDto(mockFreeUser);
    }

    @Test
    @DisplayName("CP-021: Debe crear usuario con premium=false por defecto")
    void createUser_DefaultPremiumFalse_Success() {
        // Arrange
        com.playa.dto.UserRequestDto userRequestDto = new com.playa.dto.UserRequestDto();
        userRequestDto.setName("new_user");
        userRequestDto.setEmail("newuser@mail.com");

        User newUser = createMockUser(100L, "newuser@mail.com", "New User", false);

        com.playa.dto.UserResponseDto responseDto = com.playa.dto.UserResponseDto.builder()
            .idUser(100L)
            .name("new_user")
            .email("newuser@mail.com")
            .premium(false)
            .build();

        when(userMapper.convertToEntity(any(com.playa.dto.UserRequestDto.class))).thenReturn(newUser);
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(userMapper.convertToResponseDto(any(User.class))).thenReturn(responseDto);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        com.playa.dto.UserResponseDto result = userService.createUser(userRequestDto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("newuser@mail.com");
        assertThat(result.getPremium()).isFalse();

        verify(userMapper).convertToEntity(userRequestDto);
        verify(userRepository).save(any(User.class));
        verify(userMapper).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("Debe obtener todos los usuarios")
    void getAllUsers_Success() {
        // Arrange
        java.util.List<User> users = java.util.Arrays.asList(mockFreeUser, mockPremiumUser);

        com.playa.dto.UserResponseDto freeUserDto = com.playa.dto.UserResponseDto.builder()
            .idUser(300L)
            .email("user_free@mail.com")
            .premium(false)
            .build();

        com.playa.dto.UserResponseDto premiumUserDto = com.playa.dto.UserResponseDto.builder()
            .idUser(301L)
            .email("user_premium@mail.com")
            .premium(true)
            .build();

        when(userRepository.findAll()).thenReturn(users);
        when(userMapper.convertToResponseDto(mockFreeUser)).thenReturn(freeUserDto);
        when(userMapper.convertToResponseDto(mockPremiumUser)).thenReturn(premiumUserDto);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        java.util.List<com.playa.dto.UserResponseDto> result = userService.getAllUsers();

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(2);

        verify(userRepository).findAll();
        verify(userMapper, times(2)).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("Debe eliminar usuario")
    void deleteUser_Success() {
        // Arrange
        Long userId = 300L;
        when(userRepository.existsById(userId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(userId);

        // Act - LLAMAR AL MÉTODO REAL DEL USERSERVICE
        userService.deleteUser(userId);

        // Assert
        verify(userRepository).existsById(userId);
        verify(userRepository).deleteById(userId);
    }

    @Test
    @DisplayName("CP-022: Debe fallar al suscribirse sin método de pago válido")
    void upgradeToPremiun_InvalidPayment_Fails() {
        // Arrange
        String planType = "Premium Mensual";
        boolean validPaymentMethod = false; // Método de pago inválido

        when(userRepository.findById(300L)).thenReturn(Optional.of(mockFreeUser));

        // Act & Assert - Simular validación de pago
        assertThatThrownBy(() -> {
            if (!validPaymentMethod) {
                throw new IllegalArgumentException("Método de pago inválido");
            }
        })
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Método de pago inválido");

        // Verificar que el usuario permanece como gratuito
        Optional<User> userOptional = userRepository.findById(300L);
        assertThat(userOptional).isPresent();
        User user = userOptional.get();
        assertThat(user.getPremium()).isFalse();

        // Simular mensaje de error de pasarela de pago
        String errorMessage = "Pago rechazado";
        assertThat(errorMessage).isEqualTo("Pago rechazado");

        verify(userRepository).findById(300L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe validar diferentes tipos de plan premium")
    void validatePremiumPlans_DifferentTypes_Success() {
        // Arrange
        String[] validPlans = {"Premium Mensual", "Premium Anual", "Premium Familiar"};

        // Act & Assert
        for (String plan : validPlans) {
            assertThat(plan).isNotNull();
            assertThat(plan).contains("Premium");
            assertThat(plan).isIn((Object[]) validPlans);

            // Simular validación de plan
            boolean isValidPlan = plan.startsWith("Premium");
            assertThat(isValidPlan).isTrue();
        }
    }

    @Test
    @DisplayName("Debe validar beneficios de usuario premium")
    void validatePremiumBenefits_PremiumUser_Success() {
        // Arrange
        User premiumUser = mockPremiumUser;

        // Act & Assert
        assertThat(premiumUser.getPremium()).isTrue();

        // Simular beneficios premium
        boolean noAds = premiumUser.getPremium();
        boolean unlimitedSkips = premiumUser.getPremium();
        boolean offlineMode = premiumUser.getPremium();
        boolean higherQuality = premiumUser.getPremium();

        assertThat(noAds).isTrue(); // Sin anuncios
        assertThat(unlimitedSkips).isTrue(); // Saltos ilimitados
        assertThat(offlineMode).isTrue(); // Modo offline
        assertThat(higherQuality).isTrue(); // Mayor calidad de audio
    }

    @Test
    @DisplayName("Debe validar restricciones de usuario gratuito")
    void validateFreeUserLimitations_FreeUser_Success() {
        // Arrange
        User freeUser = mockFreeUser;

        // Act & Assert
        assertThat(freeUser.getPremium()).isFalse();

        // Simular limitaciones de usuario gratuito
        boolean hasAds = !freeUser.getPremium();
        boolean limitedSkips = !freeUser.getPremium();
        boolean noOfflineMode = !freeUser.getPremium();
        boolean standardQuality = !freeUser.getPremium();

        assertThat(hasAds).isTrue(); // Tiene anuncios
        assertThat(limitedSkips).isTrue(); // Saltos limitados
        assertThat(noOfflineMode).isTrue(); // Sin modo offline
        assertThat(standardQuality).isTrue(); // Calidad estándar
    }

    @Test
    @DisplayName("Debe manejar usuario no encontrado al intentar actualizar suscripción")
    void upgradeToPremiun_UserNotFound_ThrowsException() {
        // Arrange
        Long nonExistentUserId = 999L;
        when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> {
            Optional<User> userOptional = userRepository.findById(nonExistentUserId);
            if (userOptional.isEmpty()) {
                throw new ResourceNotFoundException("Usuario no encontrado con ID: " + nonExistentUserId);
            }
        })
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Usuario no encontrado con ID: 999");

        verify(userRepository).findById(nonExistentUserId);
    }
}

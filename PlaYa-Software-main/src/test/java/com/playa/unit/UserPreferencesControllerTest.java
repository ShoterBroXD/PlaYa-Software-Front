package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.controller.UserController;
import com.playa.dto.UserPreferencesDto;
import com.playa.model.User;
import com.playa.repository.UserRepository;
import com.playa.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserPreferencesController - Pruebas Unitarias US-010")
class UserPreferencesControllerTest {
    private MockMvc mockMvc;

    @Mock
    private UserService userService; // Mock para pruebas de controlador

    @Mock
    private UserRepository userRepository; // Mock para pruebas de servicio

    @InjectMocks
    private UserController userController; // Controlador a inyectar para MockMvc

    @InjectMocks
    private UserService userServiceReal; // Instancia real del servicio para lógica de negocio

    private User existingUser; // Usuario reutilizado en pruebas de servicio

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
        existingUser = User.builder()
                .idUser(1L)
                .email("listener@mail.com")
                .password("encoded")
                .name("Oyente 1")
                .premium(false)
                .active(true)
                .registerDate(LocalDateTime.now())
                .favoriteGenres(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("CP-044: Ajustar géneros favoritos exitosamente (Jazz, Clásica)")
    void updatePreferences_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        UserPreferencesDto dto = new UserPreferencesDto();
        dto.setUserId(userId);
        dto.setFavoriteGenres(List.of("Jazz", "Clásica"));

        // Act & Assert
        mockMvc.perform(put("/users/" + userId + "/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Preferencias actualizadas correctamente"));

        // Assert (interacciones)
        verify(userService).updateUserPreferences(userId, List.of("Jazz", "Clásica"));
    }

    @Test
    @DisplayName("CP-045: Intentar seleccionar más de 5 géneros favoritos - debe fallar")
    void updatePreferences_MoreThanFiveGenres_Fails() throws Exception {
        // Arrange
        Long userId = 2L;
        UserPreferencesDto dto = new UserPreferencesDto();
        dto.setUserId(userId);
        dto.setFavoriteGenres(List.of("Rock", "Pop", "Jazz", "Clásica", "Electrónica", "Metal")); // 6 géneros

        // Act & Assert
        mockMvc.perform(put("/users/" + userId + "/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Solo puedes seleccionar hasta 5 géneros favoritos"));

        // Assert (interacciones)
        verify(userService, never()).updateUserPreferences(anyLong(), anyList());
    }

    @Test
    @DisplayName("CP-046: Reiniciar preferencias de recomendaciones exitosamente")
    void resetPreferences_Success() throws Exception {
        // Arrange
        Long userId = 3L;

        // Act & Assert
        mockMvc.perform(post("/users/" + userId + "/preferences/reset")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Preferencias reiniciadas. Recibirás recomendaciones desde cero"));

        // Assert (interacciones)
        verify(userService).resetUserPreferences(userId);
    }

    @Test
    @DisplayName("CP-047: Intentar guardar sin géneros seleccionados - debe fallar")
    void updatePreferences_EmptyGenres_Fails() throws Exception {
        // Arrange
        Long userId = 4L;
        UserPreferencesDto dto = new UserPreferencesDto();
        dto.setUserId(userId);
        dto.setFavoriteGenres(List.of()); // vacío

        // Act & Assert
        mockMvc.perform(put("/users/" + userId + "/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Debes seleccionar al menos una preferencia"));

        // Assert (interacciones)
        verify(userService, never()).updateUserPreferences(anyLong(), anyList());
    }

    @Test
    @DisplayName("CP-044: Debe actualizar géneros favoritos correctamente (Jazz, Clásica) [Service]")
    void updateUserPreferences_SetsGenresSuccessfully_Service() {
        // Arrange
        List<String> newGenres = List.of("Jazz", "Clásica");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        userServiceReal.updateUserPreferences(1L, newGenres);

        // Assert
        org.assertj.core.api.Assertions.assertThat(existingUser.getFavoriteGenres()).containsExactly("Jazz", "Clásica");
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("CP-046: Debe resetear preferencias limpiando géneros e idgenre [Service]")
    void resetUserPreferences_ClearsGenresAndIdGenre_Service() {
        // Arrange
        existingUser.setFavoriteGenres(new ArrayList<>(List.of("Rock", "Pop", "Jazz")));
        existingUser.setIdgenre(5L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        userServiceReal.resetUserPreferences(1L);

        // Assert
        org.assertj.core.api.Assertions.assertThat(existingUser.getFavoriteGenres()).isEmpty();
        org.assertj.core.api.Assertions.assertThat(existingUser.getIdgenre()).isNull();
        verify(userRepository).save(existingUser);
    }
}

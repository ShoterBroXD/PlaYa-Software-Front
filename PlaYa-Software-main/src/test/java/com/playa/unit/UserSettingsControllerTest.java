package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.controller.UserController;
import com.playa.dto.UpdateLanguageRequest;
import com.playa.dto.UpdatePrivacyRequest;
import com.playa.model.User;
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

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserSettingsController - Pruebas de Configuración (US-019)")
class UserSettingsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;

    private User user;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
        user = User.builder()
                .idUser(50L)
                .email("user@mail.com")
                .password("pwd")
                .name("Usuario Config")
                .premium(false)
                .active(true)
                .registerDate(LocalDateTime.now())
                .language("Español")
                .historyVisible(true)
                .build();
    }

    @Test
    @DisplayName("CP-055: Actualizar idioma a Português exitosamente")
    void updateLanguage_Portugues_Success() throws Exception {
        UpdateLanguageRequest req = new UpdateLanguageRequest();
        req.setLanguage("Português");

        mockMvc.perform(put("/users/" + user.getIdUser() + "/settings/language")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("Idioma actualizado correctamente"));

        verify(userService).updateUserLanguage(user.getIdUser(), "Português");
    }

    @Test
    @DisplayName("CP-056: Desactivar visibilidad del historial exitosamente")
    void updatePrivacy_HistoryHidden_Success() throws Exception {
        UpdatePrivacyRequest req = new UpdatePrivacyRequest();
        req.setHistoryVisible(false);

        mockMvc.perform(put("/users/" + user.getIdUser() + "/settings/privacy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("Configuración de privacidad actualizada correctamente"));

        verify(userService).updateUserHistoryVisibility(user.getIdUser(), false);
    }
}


package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.dto.*;
import com.playa.service.SocialService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para SocialController - Funcionalidad 04: Integración con Redes Sociales")
class SocialControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SocialService socialService;

    @InjectMocks
    private com.playa.controller.SocialController socialController;

    private ObjectMapper objectMapper;
    private SocialShareRequestDto shareRequestDto;
    private SocialShareResponseDto shareResponseDto;
    private SocialConnectRequestDto connectRequestDto;
    private SocialConnectResponseDto connectResponseDto;
    private SongShareLinkDto shareLinkDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(socialController).build();
        objectMapper = new ObjectMapper();

        shareRequestDto = SocialShareRequestDto.builder()
                .songId(1L)
                .platform("facebook")
                .message("Test message")
                .hashtags("#music #test")
                .build();

        shareResponseDto = SocialShareResponseDto.builder()
                .shareId(1L)
                .userId(1L)
                .songId(1L)
                .songTitle("Test Song")
                .platform("facebook")
                .shareUrl("https://www.facebook.com/sharer/sharer.php?u=...")
                .message("Test message")
                .sharedAt(LocalDateTime.now())
                .success(true)
                .build();

        connectRequestDto = SocialConnectRequestDto.builder()
                .platform("instagram")
                .credentials("testartist")
                .profileUrl("https://www.instagram.com/testartist")
                .build();

        connectResponseDto = SocialConnectResponseDto.builder()
                .platform("instagram")
                .status("connected")
                .message("Red social vinculada exitosamente")
                .profileUrl("https://www.instagram.com/testartist")
                .connectedAt(LocalDateTime.now())
                .isActive(true)
                .build();

        shareLinkDto = SongShareLinkDto.builder()
                .songId(1L)
                .songTitle("Test Song")
                .artistName("Test Artist")
                .coverImageUrl("https://example.com/cover.jpg")
                .shareUrl("http://localhost:8080/songs/1")
                .shareText("🎵 Escucha \"Test Song\" en PlaYa! 🎵")
                .build();
    }

    @Test
    @DisplayName("Compartir canción con datos válidos - Debería retornar 201")
    void shareSong_WithValidData_ShouldReturn201() throws Exception {
        // Given
        when(socialService.shareSong(eq(1L), any(SocialShareRequestDto.class))).thenReturn(shareResponseDto);

        // When & Then
        mockMvc.perform(post("/social/share")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shareRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.platform").value("facebook"))
                .andExpect(jsonPath("$.songTitle").value("Test Song"));
    }

    @Test
    @DisplayName("Compartir canción sin header iduser - Debería retornar 400")
    void shareSong_WithoutIdUserHeader_ShouldReturn400() throws Exception {
        // When & Then
        mockMvc.perform(post("/social/share")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shareRequestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Compartir canción con plataforma inválida - Debería retornar 400")
    void shareSong_WithInvalidPlatform_ShouldReturn400() throws Exception {
        // Given
        shareRequestDto.setPlatform("invalid-platform");

        // When & Then
        mockMvc.perform(post("/social/share")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shareRequestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Obtener comparticiones del usuario - Debería retornar 200")
    void getUserShares_WithValidUser_ShouldReturn200() throws Exception {
        // Given
        List<SocialShareResponseDto> shares = List.of(shareResponseDto);
        when(socialService.getUserShares(1L)).thenReturn(shares);

        // When & Then
        mockMvc.perform(get("/social/shares")
                .header("iduser", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].platform").value("facebook"));
    }

    @Test
    @DisplayName("Obtener comparticiones de canción - Debería retornar 200")
    void getSongShares_ShouldReturn200() throws Exception {
        // Given
        List<SocialShareResponseDto> shares = List.of(shareResponseDto);
        when(socialService.getSongShares(1L)).thenReturn(shares);

        // When & Then
        mockMvc.perform(get("/social/shares/song/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].songId").value(1));
    }

    @Test
    @DisplayName("Obtener contador de comparticiones - Debería retornar 200")
    void getSongShareCount_ShouldReturn200() throws Exception {
        // Given
        when(socialService.getSongShareCount(1L)).thenReturn(5L);

        // When & Then
        mockMvc.perform(get("/social/shares/count/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    @DisplayName("Generar enlace de compartir - Debería retornar 200")
    void generateShareLink_ShouldReturn200() throws Exception {
        // Given
        when(socialService.generateShareLink(1L)).thenReturn(shareLinkDto);

        // When & Then
        mockMvc.perform(get("/social/share-link/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.songId").value(1))
                .andExpect(jsonPath("$.songTitle").value("Test Song"));
    }

    @Test
    @DisplayName("Conectar red social con datos válidos - Debería retornar 200")
    void connectSocialNetwork_WithValidData_ShouldReturn200() throws Exception {
        // Given
        when(socialService.connectSocialNetwork(eq(1L), any(SocialConnectRequestDto.class)))
                .thenReturn(connectResponseDto);

        // When & Then
        mockMvc.perform(post("/social/connect")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(connectRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("connected"))
                .andExpect(jsonPath("$.platform").value("instagram"));
    }

    @Test
    @DisplayName("Conectar red social con credenciales inválidas - Debería retornar 400")
    void connectSocialNetwork_WithInvalidCredentials_ShouldReturn400() throws Exception {
        // Given
        when(socialService.connectSocialNetwork(eq(1L), any(SocialConnectRequestDto.class)))
                .thenThrow(new IllegalArgumentException("Ingrese las credenciales correctas"));

        // When & Then
        mockMvc.perform(post("/social/connect")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(connectRequestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Actualizar perfil social con datos válidos - Debería retornar 200")
    void updateSocialProfile_WithValidData_ShouldReturn200() throws Exception {
        // Given
        SocialProfileRequestDto profileDto = SocialProfileRequestDto.builder()
                .facebookUrl("https://www.facebook.com/testuser")
                .twitterUrl("https://www.twitter.com/testuser")
                .build();

        UserResponseDto userResponse = UserResponseDto.builder()
                .idUser(1L)
                .name("Test Artist")
                .email("artist@test.com")
                .build();

        when(socialService.updateSocialProfiles(eq(1L), any(SocialProfileRequestDto.class)))
                .thenReturn(userResponse);

        // When & Then
        mockMvc.perform(put("/social/profile")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUser").value(1));
    }

    @Test
    @DisplayName("Verificar si usuario puede compartir - Debería retornar 200")
    void canUserShare_WithValidUser_ShouldReturn200() throws Exception {
        // Given
        when(socialService.canUserShare(1L)).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/social/can-share")
                .header("iduser", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("Obtener comparticiones de otro usuario - Debería retornar 200")
    void getOtherUserShares_ShouldReturn200() throws Exception {
        // Given
        List<SocialShareResponseDto> shares = List.of(shareResponseDto);
        when(socialService.getUserShares(2L)).thenReturn(shares);

        // When & Then
        mockMvc.perform(get("/social/shares/user/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));
    }
}

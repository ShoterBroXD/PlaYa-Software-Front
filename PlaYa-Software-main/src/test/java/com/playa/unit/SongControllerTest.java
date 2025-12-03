package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.dto.SongRequestDto;
import com.playa.dto.SongResponseDto;
import com.playa.service.SongService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para SongController - Funcionalidad 01: Subir Canción")
class SongControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SongService songService;

    @InjectMocks
    private com.playa.controller.SongController songController;

    private ObjectMapper objectMapper;
    private SongRequestDto songRequestDto;
    private SongResponseDto songResponseDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(songController).build();
        objectMapper = new ObjectMapper();

        songRequestDto = SongRequestDto.builder()
                .title("Test Song")
                .description("Test Description")
                .coverURL("https://example.com/cover.jpg")
                .fileURL("https://example.com/song.mp3")
                .visibility("public")
                .idgenre(1L)
                .duration(180.0f)
                .build();

        songResponseDto = SongResponseDto.builder()
                .idSong(1L)
                .idUser(1L)
                .title("Test Song")
                .description("Test Description")
                .coverURL("https://example.com/cover.jpg")
                .fileURL("https://example.com/song.mp3")
                .visibility("public")
                .duration(180.0f)
                .uploadDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Crear canción con datos válidos - Debería retornar 201")
    void createSong_WithValidData_ShouldReturn201() throws Exception {
        // Given
        when(songService.createSong(eq(1L), any(SongRequestDto.class))).thenReturn(songResponseDto);

        // When & Then
        mockMvc.perform(post("/songs")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(songRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Song"))
                .andExpect(jsonPath("$.idUser").value(1));
    }

    @Test
    @DisplayName("Crear canción sin header iduser - Debería retornar 400")
    void createSong_WithoutIdUserHeader_ShouldReturn400() throws Exception {
        // When & Then
        mockMvc.perform(post("/songs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(songRequestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Obtener canción por ID - Debería retornar 200")
    void getSongById_ShouldReturn200() throws Exception {
        // Given
        when(songService.getSongById(1L)).thenReturn(songResponseDto);

        // When & Then
        mockMvc.perform(get("/songs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idSong").value(1))
                .andExpect(jsonPath("$.title").value("Test Song"));
    }

    @Test
    @DisplayName("Actualizar canción - Debería retornar 200")
    void updateSong_ShouldReturn200() throws Exception {
        // Given
        when(songService.updateSong(eq(1L), any(SongRequestDto.class))).thenReturn(songResponseDto);

        // When & Then
        mockMvc.perform(put("/songs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(songRequestDto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Eliminar canción - Debería retornar 200")
    void deleteSong_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(delete("/songs/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Reportar canción - Debería retornar 200")
    void reportSong_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/songs/1/report"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Des-reportar canción - Debería retornar 200")
    void unreportSong_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/songs/1/unreport"))
                .andExpect(status().isOk());
    }
}

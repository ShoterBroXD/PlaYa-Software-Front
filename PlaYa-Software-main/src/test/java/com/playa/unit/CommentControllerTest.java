package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.dto.CommentRequestDto;
import com.playa.dto.CommentResponseDto;
import com.playa.service.CommentService;
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
@DisplayName("Tests para CommentController - Funcionalidad 02: Comentar Canciones")
class CommentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CommentService commentService;

    @InjectMocks
    private com.playa.controller.CommentController commentController;

    private ObjectMapper objectMapper;
    private CommentRequestDto commentRequestDto;
    private CommentResponseDto commentResponseDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(commentController).build();
        objectMapper = new ObjectMapper();

        commentRequestDto = new CommentRequestDto();
        commentRequestDto.setIdSong(1L);
        commentRequestDto.setContent("Test comment");
        commentRequestDto.setParentComment(null);

        commentResponseDto = CommentResponseDto.builder()
                .idComment(1L)
                .idUser(1L)
                .idSong(1L)
                .content("Test comment")
                .date(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Crear comentario con datos válidos - Debería retornar 201")
    void createComment_WithValidData_ShouldReturn201() throws Exception {
        // Given
        when(commentService.createComment(eq(1L), any(CommentRequestDto.class))).thenReturn(commentResponseDto);

        // When & Then
        mockMvc.perform(post("/comments")
                .header("iduser", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Test comment"))
                .andExpect(jsonPath("$.idUser").value(1));
    }

    @Test
    @DisplayName("Crear comentario sin header iduser - Debería retornar 400")
    void createComment_WithoutIdUserHeader_ShouldReturn400() throws Exception {
        // When & Then
        mockMvc.perform(post("/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentRequestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Obtener comentarios de canción - Debería retornar 200")
    void getCommentsBySong_ShouldReturn200() throws Exception {
        // Given
        List<CommentResponseDto> comments = List.of(commentResponseDto);
        when(commentService.getCommentsBySong(1L)).thenReturn(comments);

        // When & Then
        mockMvc.perform(get("/comments/song/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Test comment"));
    }

    @Test
    @DisplayName("Obtener comentario por ID - Debería retornar 200")
    void getComment_ShouldReturn200() throws Exception {
        // Given
        when(commentService.getComment(1L)).thenReturn(commentResponseDto);

        // When & Then
        mockMvc.perform(get("/comments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idComment").value(1));
    }

    @Test
    @DisplayName("Reportar comentario - Debería retornar 200")
    void reportComment_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/comments/1/report"))
                .andExpect(status().isOk())
                .andExpect(content().string("Comentario reportado y ocultado exitosamente"));
    }

    @Test
    @DisplayName("Des-reportar comentario - Debería retornar 200")
    void unreportComment_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/comments/1/unreport"))
                .andExpect(status().isOk())
                .andExpect(content().string("Comentario habilitado exitosamente"));
    }

    @Test
    @DisplayName("Eliminar comentario - Debería retornar 204")
    void deleteComment_ShouldReturn204() throws Exception {
        // When & Then
        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isNoContent());
    }
}

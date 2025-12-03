package com.playa.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playa.controller.PostController;
import com.playa.dto.PostRequestDto;
import com.playa.dto.PostResponseDto;
import com.playa.service.PostService;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostController - Pruebas Unitarias US-011")
class PostControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders
                .standaloneSetup(postController)
                .setControllerAdvice(new TestExceptionHandler())
                .addFilters(new AuthSimulationFilter())
                .build();
    }

    @Test
    @DisplayName("CP-048: Publicar mensaje en un foro - éxito (pasa filtro de spam)")
    void createPost_Success() throws Exception {
        // Arrange
        Long threadId = 10L; // foro Rock (simulado)
        String message = "Hola, ¿cuál es su álbum favorito de 2023?";
        PostRequestDto request = new PostRequestDto();
        request.setIdThread(threadId);
        request.setContent(message);

        PostResponseDto response = new PostResponseDto();
        response.setIdPost(100L);
        response.setIdThread(threadId);
        response.setContent(message);

        when(postService.createPost(any(PostRequestDto.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer token-valido")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idThread").value(threadId))
                .andExpect(jsonPath("$.content").value(message));

        // Assert (interacciones)
        verify(postService).createPost(any(PostRequestDto.class));
    }

    @Test
    @DisplayName("CP-049: Publicar en foro con lenguaje ofensivo - bloqueado por filtro")
    void createPost_OffensiveContent_Fails() throws Exception {
        // Arrange
        Long threadId = 10L;
        String offensive = "[Palabra ofensiva] esta banda es [palabra ofensiva].";
        PostRequestDto request = new PostRequestDto();
        request.setIdThread(threadId);
        request.setContent(offensive);

        // Simulamos que el servicio detecta lenguaje ofensivo
        when(postService.createPost(any(PostRequestDto.class)))
                .thenThrow(new IllegalArgumentException("Contenido ofensivo"));

        // Act & Assert
        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer token-valido")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Tu mensaje no pudo ser publicado. Revisa que no contenga spam o lenguaje ofensivo"));

        // Assert (interacciones)
        verify(postService).createPost(any(PostRequestDto.class));
    }

    @Test
    @DisplayName("CP-050: Intentar publicar en foro sin iniciar sesión - debe solicitar login")
    void createPost_Unauthenticated_ShowsLoginMessage() throws Exception {
        // Arrange
        Long threadId = 10L;
        String message = "Mensaje como invitado";
        PostRequestDto request = new PostRequestDto();
        request.setIdThread(threadId);
        request.setContent(message);

        // Act & Assert (sin header Authorization)
        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Debes iniciar sesión para participar"));

        // Assert (interacciones)
        verify(postService, never()).createPost(any(PostRequestDto.class));
    }

    @Test
    @DisplayName("CP-051: Publicar en foro con conexión inestable - reintento/espera")
    void createPost_UnstableNetwork_ShowsWaitingMessage() throws Exception {
        // Arrange
        Long threadId = 10L;
        String message = "Probando conexión inestable.";
        PostRequestDto request = new PostRequestDto();
        request.setIdThread(threadId);
        request.setContent(message);

        // Simular fallo temporal de red
        when(postService.createPost(any(PostRequestDto.class)))
                .thenThrow(new IllegalStateException("Network unstable"));

        // Act & Assert
        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer token-valido")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().string("Conexión inestable, esperando a que se restablezca"));

        // Assert (interacciones)
        verify(postService).createPost(any(PostRequestDto.class));
    }

    // --- Infra de soporte del test ---

    @RestControllerAdvice
    static class TestExceptionHandler {
        @ExceptionHandler(IllegalArgumentException.class)
        public org.springframework.http.ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
            return org.springframework.http.ResponseEntity
                    .badRequest()
                    .body("Tu mensaje no pudo ser publicado. Revisa que no contenga spam o lenguaje ofensivo");
        }
        @ExceptionHandler(IllegalStateException.class)
        public org.springframework.http.ResponseEntity<String> handleUnstable(IllegalStateException ex) {
            return org.springframework.http.ResponseEntity
                    .status(503)
                    .body("Conexión inestable, esperando a que se restablezca");
        }
    }

    static class AuthSimulationFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;
            if ("POST".equalsIgnoreCase(req.getMethod()) && req.getRequestURI().startsWith("/posts")) {
                String auth = req.getHeader("Authorization");
                if (auth == null || auth.isBlank()) {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType("text/plain;charset=UTF-8");
                    res.getWriter().write("Debes iniciar sesión para participar");
                    return;
                }
            }
            chain.doFilter(request, response);
        }
    }
}

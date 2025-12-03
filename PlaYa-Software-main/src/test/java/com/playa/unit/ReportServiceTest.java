package com.playa.unit;

import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Comment;
import com.playa.model.Report;
import com.playa.model.Song;
import com.playa.model.User;
import com.playa.repository.CommentRepository;
import com.playa.repository.ReportRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService - Pruebas Unitarias US-014")
class ReportServiceTest {

    @Mock
    private SongRepository songRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

    private User mockUser;
    private User mockOwner;
    private Song mockSong;
    private Comment mockComment;

    @BeforeEach
    void setUp() {
        mockUser = createMockUser(123L, "reporter@mail.com", "Reporter User");
        mockOwner = createMockUser(456L, "owner@mail.com", "Song Owner");
        mockSong = createMockSong(500L, "Test Song", mockOwner);
        mockComment = createMockComment(1L, "Test comment");
    }

    private User createMockUser(Long id, String email, String name) {
        return User.builder()
                .idUser(id)
                .email(email)
                .name(name)
                .build();
    }

    private Song createMockSong(Long id, String title, User owner) {
        Song song = new Song();
        song.setIdSong(id);
        song.setTitle(title);
        song.setUser(owner);
        song.setDuration(3.5f);
        song.setVisibility("public");
        song.setVisible(true);
        return song;
    }

    private Comment createMockComment(Long id, String content) {
        Comment comment = new Comment();
        comment.setIdComment(id);
        comment.setContent(content);
        comment.setDate(LocalDateTime.now());
        return comment;
    }


    @Test
    @DisplayName("CP-001: Debe reportar canción exitosamente con datos válidos")
    void reportSong_ValidData_Success() {
        // Arrange
        Long songId = 500L;
        Long userId = 123L;
        String reason = "Discurso de odio";

        Report mockReport = Report.builder()
                .idReport(1L)
                .reporter(mockUser)
                .song(mockSong)
                .reason(reason)
                .status(Report.ReportStatus.PENDING)
                .reportDate(LocalDateTime.now())
                .build();

        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(reportRepository.save(any(Report.class))).thenReturn(mockReport);

        // Act
        Report result = reportService.reportSong(songId, userId, reason);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIdReport()).isEqualTo(1L);
        assertThat(result.getReason()).isEqualTo(reason);
        assertThat(result.getStatus()).isEqualTo(Report.ReportStatus.PENDING);
        assertThat(result.getReporter()).isEqualTo(mockUser);
        assertThat(result.getSong()).isEqualTo(mockSong);
        verify(songRepository).findById(songId);
        verify(userRepository).findById(userId);
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    @DisplayName("CP-002: Debe fallar cuando el motivo del reporte es nulo")
    void reportSong_NullReason_ThrowsException() {
        // Arrange
        Long songId = 500L;
        Long userId = 123L;
        String reason = null;

        // Act & Assert
        assertThatThrownBy(() -> reportService.reportSong(songId, userId, reason))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Debes indicar el motivo del reporte");

        verify(songRepository, never()).findById(anyLong());
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("CP-003: Debe fallar cuando el motivo del reporte está vacío")
    void reportSong_EmptyReason_ThrowsException() {
        // Arrange
        Long songId = 500L;
        Long userId = 123L;
        String reason = "   ";

        // Act & Assert
        assertThatThrownBy(() -> reportService.reportSong(songId, userId, reason))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Debes indicar el motivo del reporte");

        verify(songRepository, never()).findById(anyLong());
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("CP-004: Debe fallar cuando la canción no existe")
    void reportSong_SongNotFound_ThrowsException() {
        // Arrange
        Long songId = 999L;
        Long userId = 123L;
        String reason = "Contenido sexual";

        when(songRepository.findById(songId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.reportSong(songId, userId, reason))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Canción no encontrada con ID: " + songId);

        verify(songRepository).findById(songId);
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("CP-005: Debe fallar cuando el usuario no existe")
    void reportSong_UserNotFound_ThrowsException() {
        // Arrange
        Long songId = 500L;
        Long userId = 999L;
        String reason = "Violencia";

        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.reportSong(songId, userId, reason))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Usuario no encontrado con ID: " + userId);

        verify(songRepository).findById(songId);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("CP-006: Debe fallar cuando el usuario intenta reportar su propia canción")
    void reportSong_OwnSong_ThrowsException() {
        // Arrange
        Long songId = 500L;
        Long userId = 456L; // mismo ID que el owner
        String reason = "Spam";

        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockOwner));

        // Act & Assert
        assertThatThrownBy(() -> reportService.reportSong(songId, userId, reason))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("No puedes reportar tu propia canción");

        verify(songRepository).findById(songId);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("CP-007: Debe validar que la canción existe correctamente")
    void validateSongExists_ValidSong_Returnssong() {
        // Arrange
        Long songId = 500L;
        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));

        // Act
        Song result = reportService.validateSongExists(songId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIdSong()).isEqualTo(songId);
        assertThat(result.getTitle()).isEqualTo("Test Song");
        verify(songRepository).findById(songId);
    }

    @Test
    @DisplayName("CP-008: Debe lanzar excepción cuando la canción no existe en validación")
    void validateSongExists_InvalidSong_ThrowsException() {
        // Arrange
        Long songId = 999L;
        when(songRepository.findById(songId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.validateSongExists(songId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Canción no encontrada con ID: " + songId);

        verify(songRepository).findById(songId);
    }

    @Test
    @DisplayName("CP-009: Debe validar que el usuario existe correctamente")
    void validateUserExists_ValidUser_ReturnsUser() {
        // Arrange
        Long userId = 123L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        User result = reportService.validateUserExists(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIdUser()).isEqualTo(userId);
        assertThat(result.getName()).isEqualTo("Reporter User");
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("CP-010: Debe lanzar excepción cuando el usuario no existe en validación")
    void validateUserExists_InvalidUser_ThrowsException() {
        // Arrange
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.validateUserExists(userId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Usuario no encontrado con ID: " + userId);

        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("CP-011: Debe contar las canciones del usuario correctamente")
    void countUserSongs_ValidUser_ReturnsCount() {
        // Arrange
        Long userId = 123L;
        Long expectedCount = 5L;

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(songRepository.countByUserAndVisibilityNot(mockUser, "deleted")).thenReturn(expectedCount);

        // Act
        Long result = reportService.countUserSongs(userId);

        // Assert
        assertThat(result).isEqualTo(expectedCount);
        verify(userRepository).findById(userId);
        verify(songRepository).countByUserAndVisibilityNot(mockUser, "deleted");
    }

    @Test
    @DisplayName("CP-012: Debe obtener comentarios de la canción correctamente")
    void getSongComments_ValidSong_ReturnsComments() {
        // Arrange
        Long songId = 500L;
        List<Comment> expectedComments = List.of(mockComment);

        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));
        when(commentRepository.findBySong_IdSongOrderByDateDesc(songId)).thenReturn(expectedComments);

        // Act
        List<Comment> result = reportService.getSongComments(songId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getContent()).isEqualTo("Test comment");
        verify(songRepository).findById(songId);
        verify(commentRepository).findBySong_IdSongOrderByDateDesc(songId);
    }

    @Test
    @DisplayName("CP-013: Debe validar motivos de reporte válidos")
    void isValidReportReason_ValidReasons_ReturnsTrue() {
        // Arrange
        String[] validReasons = {
            "Discurso de odio",
            "Contenido sexual",
            "Violencia",
            "Spam",
            "Derechos de autor"
        };

        // Act & Assert
        for (String reason : validReasons) {
            boolean result = reportService.isValidReportReason(reason);
            assertThat(result).isTrue();
        }
    }

    @Test
    @DisplayName("CP-014: Debe rechazar motivos de reporte inválidos")
    void isValidReportReason_InvalidReason_ReturnsFalse() {
        // Arrange
        String invalidReason = "Motivo no válido";

        // Act
        boolean result = reportService.isValidReportReason(invalidReason);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("CP-015: Debe rechazar motivo de reporte nulo")
    void isValidReportReason_NullReason_ReturnsFalse() {
        // Act
        boolean result = reportService.isValidReportReason(null);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("CP-016: Debe rechazar motivo de reporte vacío")
    void isValidReportReason_EmptyReason_ReturnsFalse() {
        // Act
        boolean result = reportService.isValidReportReason("   ");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("CP-017: Debe crear estructura de reporte correctamente")
    void createReportStructure_ValidData_ReturnsSuccessMessage() {
        // Arrange
        Long userId = 123L;
        Long songId = 500L;
        String reason = "Spam";

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));

        // Act
        String result = reportService.createReportStructure(userId, songId, reason);

        // Assert
        assertThat(result).isEqualTo("Reporte creado exitosamente para canción " + songId + " por usuario " + userId + " con motivo: " + reason);
        verify(userRepository).findById(userId);
        verify(songRepository).findById(songId);
    }

    @Test
    @DisplayName("CP-018: Debe fallar al crear estructura con motivo inválido")
    void createReportStructure_InvalidReason_ThrowsException() {
        // Arrange
        Long userId = 123L;
        Long songId = 500L;
        String reason = "Motivo inválido";

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(songRepository.findById(songId)).thenReturn(Optional.of(mockSong));

        // Act & Assert
        assertThatThrownBy(() -> reportService.createReportStructure(userId, songId, reason))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Motivo de reporte no válido");

        verify(userRepository).findById(userId);
        verify(songRepository).findById(songId);
    }

    @Test
    @DisplayName("CP-019: Debe fallar al crear estructura con usuario inválido")
    void createReportStructure_InvalidUser_ThrowsException() {
        // Arrange
        Long userId = 999L;
        Long songId = 500L;
        String reason = "Spam";

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.createReportStructure(userId, songId, reason))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Usuario no encontrado con ID: " + userId);

        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("CP-020: Debe fallar al crear estructura con canción inválida")
    void createReportStructure_InvalidSong_ThrowsException() {
        // Arrange
        Long userId = 123L;
        Long songId = 999L;
        String reason = "Spam";

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(songRepository.findById(songId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.createReportStructure(userId, songId, reason))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Canción no encontrada con ID: " + songId);

        verify(userRepository).findById(userId);
        verify(songRepository).findById(songId);
    }
}

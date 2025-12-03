package com.playa.unit;

import com.playa.dto.CommentRequestDto;
import com.playa.dto.CommentResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.CommentMapper;
import com.playa.model.Comment;
import com.playa.model.Song;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import com.playa.repository.CommentRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.service.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para CommentService - Funcionalidad 02: Comentar Canciones")
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SongRepository songRepository;

    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentService commentService;

    private User user;
    private Song song;
    private Comment comment;
    private CommentRequestDto commentRequestDto;
    private CommentResponseDto commentResponseDto;

    @BeforeEach
    void setUp() {
        // Usuario
        user = User.builder()
                .idUser(1L)
                .name("Test User")
                .email("user@test.com")
                .type(Rol.LISTENER)
                .premium(false)
                .registerDate(LocalDateTime.now())
                .build();

        // Canción
        song = Song.builder()
                .idSong(1L)
                .title("Test Song")
                .user(user)
                .build();

        // Comentario
        comment = Comment.builder()
                .idComment(1L)
                .idUser(1L)
                .song(song)
                .content("Test comment")
                .visible(true)
                .date(LocalDateTime.now())
                .build();

        // DTO de request
        commentRequestDto = new CommentRequestDto();
        commentRequestDto.setIdSong(1L);
        commentRequestDto.setContent("Test comment");
        commentRequestDto.setParentComment(null);

        // DTO de response
        commentResponseDto = CommentResponseDto.builder()
                .idComment(1L)
                .idUser(1L)
                .idSong(1L)
                .content("Test comment")
                .date(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Crear comentario con datos válidos - Debería crear exitosamente")
    void createComment_WithValidData_ShouldCreateCommentSuccessfully() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(songRepository.existsById(1L)).thenReturn(true);
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(commentMapper.convertToResponseDto(comment)).thenReturn(commentResponseDto);

        // When
        CommentResponseDto result = commentService.createComment(1L, commentRequestDto);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getIdComment());
        assertEquals("Test comment", result.getContent());
        assertEquals(1L, result.getIdUser());
        assertEquals(1L, result.getIdSong());

        verify(userRepository).existsById(1L);
        verify(songRepository).existsById(1L);
        verify(songRepository).findById(1L);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Crear comentario con usuario no existente - Debería lanzar ResourceNotFoundException")
    void createComment_WithNonExistentUser_ShouldThrowResourceNotFoundException() {
        // Given
        when(userRepository.existsById(999L)).thenReturn(false);

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            commentService.createComment(999L, commentRequestDto);
        });

        assertTrue(exception.getMessage().contains("El usuario con ID 999 no existe"));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("Crear comentario con canción no existente - Debería lanzar ResourceNotFoundException")
    void createComment_WithNonExistentSong_ShouldThrowResourceNotFoundException() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        when(songRepository.existsById(999L)).thenReturn(false);
        commentRequestDto.setIdSong(999L);

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            commentService.createComment(1L, commentRequestDto);
        });

        assertTrue(exception.getMessage().contains("La canción con ID 999 no existe"));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("Crear comentario con contenido vacío - Debería lanzar IllegalArgumentException")
    void createComment_WithEmptyContent_ShouldThrowIllegalArgumentException() {
        // Given
        commentRequestDto.setContent("");

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            commentService.createComment(1L, commentRequestDto);
        });

        assertTrue(exception.getMessage().contains("Los campos idUser, idSong y content son obligatorios"));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("Crear comentario con comentario padre - Debería crear respuesta exitosamente")
    void createComment_WithParentComment_ShouldCreateReplySuccessfully() {
        // Given
        commentRequestDto.setParentComment(2L);
        when(userRepository.existsById(1L)).thenReturn(true);
        when(songRepository.existsById(1L)).thenReturn(true);
        when(commentRepository.existsById(2L)).thenReturn(true);
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(commentMapper.convertToResponseDto(comment)).thenReturn(commentResponseDto);

        // When
        CommentResponseDto result = commentService.createComment(1L, commentRequestDto);

        // Then
        assertNotNull(result);
        verify(commentRepository).existsById(2L);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Crear comentario con comentario padre no existente - Debería lanzar ResourceNotFoundException")
    void createComment_WithNonExistentParentComment_ShouldThrowResourceNotFoundException() {
        // Given
        commentRequestDto.setParentComment(999L);
        when(userRepository.existsById(1L)).thenReturn(true);
        when(songRepository.existsById(1L)).thenReturn(true);
        when(commentRepository.existsById(999L)).thenReturn(false);

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            commentService.createComment(1L, commentRequestDto);
        });

        assertTrue(exception.getMessage().contains("El comentario padre con ID 999 no existe"));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    @DisplayName("Obtener comentarios de canción - Debería retornar solo comentarios visibles")
    void getCommentsBySong_WithValidSongId_ShouldReturnVisibleComments() {
        // Given
        Comment visibleComment = Comment.builder()
                .idComment(1L)
                .content("Visible comment")
                .visible(true)
                .build();

        Comment hiddenComment = Comment.builder()
                .idComment(2L)
                .content("Hidden comment")
                .visible(false)
                .build();

        List<Comment> allComments = Arrays.asList(visibleComment, hiddenComment);
        when(commentRepository.findBySong_IdSongOrderByDateDesc(1L)).thenReturn(allComments);
        when(commentMapper.convertToResponseDto(visibleComment)).thenReturn(commentResponseDto);

        // When
        List<CommentResponseDto> result = commentService.getCommentsBySong(1L);

        // Then
        assertEquals(1, result.size()); // Solo el comentario visible
        verify(commentRepository).findBySong_IdSongOrderByDateDesc(1L);
        verify(commentMapper, times(1)).convertToResponseDto(any(Comment.class));
    }

    @Test
    @DisplayName("Obtener comentario por ID válido - Debería retornar comentario")
    void getComment_WithValidId_ShouldReturnComment() {
        // Given
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentMapper.convertToResponseDto(comment)).thenReturn(commentResponseDto);

        // When
        CommentResponseDto result = commentService.getComment(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getIdComment());
        verify(commentRepository).findById(1L);
    }

    @Test
    @DisplayName("Obtener comentario con ID inválido - Debería lanzar ResourceNotFoundException")
    void getComment_WithInvalidId_ShouldThrowResourceNotFoundException() {
        // Given
        when(commentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            commentService.getComment(999L);
        });

        verify(commentRepository).findById(999L);
    }

    @Test
    @DisplayName("Eliminar comentario con ID válido - Debería eliminar exitosamente")
    void deleteComment_WithValidId_ShouldDeleteSuccessfully() {
        // Given
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        // When
        commentService.deleteComment(1L);

        // Then
        verify(commentRepository).findById(1L);
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("Reportar comentario - Debería ocultar comentario")
    void reportComment_WithValidId_ShouldHideComment() {
        // Given
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        // When
        commentService.reportComment(1L);

        // Then
        verify(commentRepository).findById(1L);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Des-reportar comentario - Debería mostrar comentario")
    void unreportComment_WithValidId_ShouldShowComment() {
        // Given
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        // When
        commentService.unreportComment(1L);

        // Then
        verify(commentRepository).findById(1L);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Verificar propietario de comentario correcto - Debería retornar true")
    void isCommentOwner_WithCorrectOwner_ShouldReturnTrue() {
        // Given
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        // When
        boolean result = commentService.isCommentOwner(1L, "user@test.com");

        // Then
        assertTrue(result);
        verify(commentRepository).findById(1L);
        verify(userRepository).findByEmail("user@test.com");
    }

    @Test
    @DisplayName("Verificar propietario de comentario incorrecto - Debería retornar false")
    void isCommentOwner_WithIncorrectOwner_ShouldReturnFalse() {
        // Given
        User otherUser = User.builder().idUser(2L).email("other@test.com").build();
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

        // When
        boolean result = commentService.isCommentOwner(1L, "other@test.com");

        // Then
        assertFalse(result);
        verify(commentRepository).findById(1L);
        verify(userRepository).findByEmail("other@test.com");
    }
}

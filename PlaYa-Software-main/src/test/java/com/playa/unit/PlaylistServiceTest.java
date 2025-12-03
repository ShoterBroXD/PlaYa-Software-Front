package com.playa.unit;

import com.playa.dto.AddSongToPlaylistDto;
import com.playa.dto.PlaylistRequestDto;
import com.playa.dto.PlaylistResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.exception.SongLimitExceededException;
import com.playa.mapper.PlaylistMapper;
import com.playa.model.Playlist;
import com.playa.model.PlaylistSong;
import com.playa.model.PlaylistSongId;
import com.playa.model.Song;
import com.playa.model.User;
import com.playa.repository.PlaylistRepository;
import com.playa.repository.PlaylistSongRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.service.PlaylistService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaylistService - Pruebas Unitarias US-013")
class PlaylistServiceTest {

    @Mock
    private PlaylistRepository playlistRepository;

    @Mock
    private PlaylistSongRepository playlistSongRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SongRepository songRepository;

    @Mock
    private PlaylistMapper playlistMapper;

    @InjectMocks
    private PlaylistService playlistService;

    private User mockUser;
    private Playlist mockPlaylist;
    private Song mockSong;

    @BeforeEach
    void setUp() {
        mockUser = createMockUser(123L, "test_listener@mail.com", "Test Listener");
        mockPlaylist = createMockPlaylist(1L, 123L, "Test Playlist", "Test Description");
        mockSong = createMockSong(55L, "Test Song");
    }

    private User createMockUser(Long id, String email, String name) {
        return User.builder()
                .idUser(id)
                .email(email)
                .name(name)
                .build();
    }

    private Playlist createMockPlaylist(Long id, Long userId, String name, String description) {
        return Playlist.builder()
                .idPlaylist(id)
                .idUser(userId)
                .name(name)
                .description(description)
                .creationDate(LocalDateTime.now())
                .visible(true)
                .build();
    }

    private Song createMockSong(Long id, String title) {
        Song song = new Song();
        song.setIdSong(id);
        song.setTitle(title);
        song.setUser(mockUser); // Usar el objeto User en lugar de idUser
        song.setDuration(3.5f);
        song.setVisibility("public");
        song.setVisible(true);
        song.setCoverURL("http://example.com/cover.jpg");
        song.setFileURL("http://example.com/song.mp3");
        return song;
    }

    private PlaylistResponseDto createMockPlaylistResponse(Long id, Long userId, String name, String description) {
        return PlaylistResponseDto.builder()
                .idPlaylist(id)
                .idUser(userId)
                .name(name)
                .description(description)
                .creationDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("CP-009: Debe crear playlist pública exitosamente")
    void createPlaylist_PublicPlaylist_Success() {
        // Arrange
        PlaylistRequestDto request = PlaylistRequestDto.builder()
                .idUser(123L)
                .name("Éxitos de Rock")
                .description("Mi selección personal")
                .build();

        when(userRepository.existsById(123L)).thenReturn(true);

        Playlist savedPlaylist = createMockPlaylist(1L, 123L, "Éxitos de Rock", "Mi selección personal");
        when(playlistRepository.save(any(Playlist.class))).thenReturn(savedPlaylist);

        PlaylistResponseDto expectedResponse = createMockPlaylistResponse(1L, 123L, "Éxitos de Rock", "Mi selección personal");
        when(playlistMapper.convertToResponseDto(savedPlaylist)).thenReturn(expectedResponse);

        // Act
        PlaylistResponseDto response = playlistService.createPlaylist(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getIdPlaylist()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Éxitos de Rock");
        assertThat(response.getDescription()).isEqualTo("Mi selección personal");
        assertThat(response.getIdUser()).isEqualTo(123L);

        verify(userRepository).existsById(123L);
        verify(playlistRepository).save(any(Playlist.class));
        verify(playlistMapper).convertToResponseDto(savedPlaylist);
    }

    @Test
    @DisplayName("CP-010: Debe crear playlist privada exitosamente")
    void createPlaylist_PrivatePlaylist_Success() {
        // Arrange
        PlaylistRequestDto request = PlaylistRequestDto.builder()
                .idUser(123L)
                .name("Para el Gym")
                .description(null) // Sin descripción
                .build();

        when(userRepository.existsById(123L)).thenReturn(true);

        Playlist savedPlaylist = createMockPlaylist(2L, 123L, "Para el Gym", null);
        when(playlistRepository.save(any(Playlist.class))).thenReturn(savedPlaylist);

        PlaylistResponseDto expectedResponse = createMockPlaylistResponse(2L, 123L, "Para el Gym", null);
        when(playlistMapper.convertToResponseDto(savedPlaylist)).thenReturn(expectedResponse);

        // Act
        PlaylistResponseDto response = playlistService.createPlaylist(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getIdPlaylist()).isEqualTo(2L);
        assertThat(response.getName()).isEqualTo("Para el Gym");
        assertThat(response.getDescription()).isNull();
        assertThat(response.getIdUser()).isEqualTo(123L);

        verify(userRepository).existsById(123L);
        verify(playlistRepository).save(any(Playlist.class));
    }

    @Test
    @DisplayName("CP-011: Debe validar que el usuario existe antes de crear playlist")
    void createPlaylist_UserNotFound_ThrowsException() {
        // Arrange
        PlaylistRequestDto request = PlaylistRequestDto.builder()
                .idUser(999L) // Usuario que no existe
                .name("Nueva Playlist")
                .description("Descripción test")
                .build();

        when(userRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> playlistService.createPlaylist(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Usuario no encontrado con ID: 999");

        verify(userRepository).existsById(999L);
        verify(playlistRepository, never()).save(any(Playlist.class));
    }

    @Test
    @DisplayName("Debe obtener playlist por ID exitosamente")
    void getPlaylistById_ExistingPlaylist_Success() {
        // Arrange
        Long playlistId = 1L;
        when(playlistRepository.findById(playlistId)).thenReturn(Optional.of(mockPlaylist));
        when(playlistSongRepository.findByPlaylistIdOrderByDateAsc(playlistId)).thenReturn(Arrays.asList());

        PlaylistResponseDto expectedResponse = createMockPlaylistResponse(1L, 123L, "Test Playlist", "Test Description");
        when(playlistMapper.convertToResponseDto(mockPlaylist)).thenReturn(expectedResponse);

        // Act
        PlaylistResponseDto response = playlistService.getPlaylistById(playlistId);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getIdPlaylist()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Playlist");

        verify(playlistRepository).findById(playlistId);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la playlist no existe")
    void getPlaylistById_NonExistingPlaylist_ThrowsException() {
        // Arrange
        Long playlistId = 999L;
        when(playlistRepository.findById(playlistId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> playlistService.getPlaylistById(playlistId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Playlist no encontrada con ID: 999");

        verify(playlistRepository).findById(playlistId);
    }

    @Test
    @DisplayName("CP-012: Debe añadir canción a playlist exitosamente")
    void addSongToPlaylist_ValidSong_Success() {
        // Arrange
        Long playlistId = 1L;
        AddSongToPlaylistDto request = AddSongToPlaylistDto.builder()
                .idSong(55L)
                .build();

        when(playlistRepository.existsById(playlistId)).thenReturn(true);
        when(songRepository.existsById(55L)).thenReturn(true);
        when(playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, 55L)).thenReturn(false);

        // Act
        playlistService.addSongToPlaylist(playlistId, request);

        // Assert
        verify(playlistRepository).existsById(playlistId);
        verify(songRepository).existsById(55L);
        verify(playlistSongRepository).existsByIdIdPlaylistAndIdIdSong(playlistId, 55L);
        verify(playlistSongRepository).save(any(PlaylistSong.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la playlist no existe al añadir canción")
    void addSongToPlaylist_PlaylistNotFound_ThrowsException() {
        // Arrange
        Long playlistId = 999L;
        AddSongToPlaylistDto request = AddSongToPlaylistDto.builder()
                .idSong(55L)
                .build();

        when(playlistRepository.existsById(playlistId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> playlistService.addSongToPlaylist(playlistId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Playlist no encontrada con ID: 999");

        verify(playlistSongRepository, never()).save(any(PlaylistSong.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la canción no existe")
    void addSongToPlaylist_SongNotFound_ThrowsException() {
        // Arrange
        Long playlistId = 1L;
        AddSongToPlaylistDto request = AddSongToPlaylistDto.builder()
                .idSong(999L)
                .build();

        when(playlistRepository.existsById(playlistId)).thenReturn(true);
        when(songRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> playlistService.addSongToPlaylist(playlistId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Canción no encontrada con ID: 999");

        verify(playlistSongRepository, never()).save(any(PlaylistSong.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la canción ya está en la playlist")
    void addSongToPlaylist_SongAlreadyExists_ThrowsException() {
        // Arrange
        Long playlistId = 1L;
        AddSongToPlaylistDto request = AddSongToPlaylistDto.builder()
                .idSong(55L)
                .build();

        when(playlistRepository.existsById(playlistId)).thenReturn(true);
        when(songRepository.existsById(55L)).thenReturn(true);
        when(playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, 55L)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> playlistService.addSongToPlaylist(playlistId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("La canción ya está en la playlist");

        verify(playlistSongRepository, never()).save(any(PlaylistSong.class));
    }

    @Test
    @DisplayName("Debe remover canción de playlist exitosamente")
    void removeSongFromPlaylist_ValidSong_Success() {
        // Arrange
        Long playlistId = 1L;
        Long songId = 55L;

        when(playlistRepository.existsById(playlistId)).thenReturn(true);
        when(playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, songId)).thenReturn(true);

        // Act
        playlistService.removeSongFromPlaylist(playlistId, songId);

        // Assert
        verify(playlistRepository).existsById(playlistId);
        verify(playlistSongRepository).existsByIdIdPlaylistAndIdIdSong(playlistId, songId);
        verify(playlistSongRepository).deleteByIdIdPlaylistAndIdIdSong(playlistId, songId);
    }

    @Test
    @DisplayName("Debe lanzar excepción al remover canción que no está en la playlist")
    void removeSongFromPlaylist_SongNotInPlaylist_ThrowsException() {
        // Arrange
        Long playlistId = 1L;
        Long songId = 999L;

        when(playlistRepository.existsById(playlistId)).thenReturn(true);
        when(playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, songId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> playlistService.removeSongFromPlaylist(playlistId, songId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("La canción no está en la playlist");

        verify(playlistSongRepository, never()).deleteByIdIdPlaylistAndIdIdSong(anyLong(), anyLong());
    }
}

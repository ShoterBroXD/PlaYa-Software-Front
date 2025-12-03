package com.playa.unit;

import com.playa.dto.*;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.*;
import com.playa.model.enums.Rol;
import com.playa.repository.SocialShareRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.service.SocialService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para SocialService - Funcionalidad 04: Integración con Redes Sociales")
class SocialServiceTest {

    @Mock
    private SocialShareRepository socialShareRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SongRepository songRepository;

    @InjectMocks
    private SocialService socialService;

    private User artistUser;
    private User listenerUser;
    private User freeUser;
    private Song song;
    private Genre genre;
    private SocialShare socialShare;
    private SocialShareRequestDto shareRequestDto;

    @BeforeEach
    void setUp() {
        // Configurar baseUrl usando reflection
        ReflectionTestUtils.setField(socialService, "baseUrl", "http://localhost:8080");

        // Usuario artista premium
        artistUser = User.builder()
                .idUser(1L)
                .name("Test Artist")
                .email("artist@test.com")
                .type(Rol.ARTIST)
                .premium(true)
                .registerDate(LocalDateTime.now())
                .build();

        // Usuario listener premium
        listenerUser = User.builder()
                .idUser(2L)
                .name("Test Listener")
                .email("listener@test.com")
                .type(Rol.LISTENER)
                .premium(true)
                .registerDate(LocalDateTime.now())
                .build();

        // Usuario gratuito
        freeUser = User.builder()
                .idUser(3L)
                .name("Free User")
                .email("free@test.com")
                .type(Rol.LISTENER)
                .premium(false)
                .registerDate(LocalDateTime.now())
                .build();

        // Género
        genre = Genre.builder()
                .idGenre(1L)
                .name("Rock")
                .build();

        // Canción
        song = Song.builder()
                .idSong(1L)
                .title("Test Song")
                .description("Test Description")
                .coverURL("https://example.com/cover.jpg")
                .user(artistUser)
                .genre(genre)
                .duration(180.0f)
                .build();

        // Compartición social
        socialShare = SocialShare.builder()
                .shareId(1L)
                .user(artistUser)
                .song(song)
                .platform("facebook")
                .shareUrl("https://www.facebook.com/sharer/sharer.php?u=http%3A//localhost%3A8080/songs/1")
                .message("Test message")
                .sharedAt(LocalDateTime.now())
                .success(true)
                .build();

        // DTO de request
        shareRequestDto = SocialShareRequestDto.builder()
                .songId(1L)
                .platform("facebook")
                .message("Test message")
                .hashtags("#music #test")
                .build();
    }

    @Test
    @DisplayName("Compartir canción con usuario premium válido - Debería compartir exitosamente")
    void shareSong_WithValidPremiumUser_ShouldShareSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(socialShareRepository.save(any(SocialShare.class))).thenReturn(socialShare);

        // When
        SocialShareResponseDto result = socialService.shareSong(1L, shareRequestDto);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getShareId());
        assertEquals("facebook", result.getPlatform());
        assertEquals("Test Song", result.getSongTitle());
        assertTrue(result.getSuccess());

        verify(userRepository).findById(1L);
        verify(songRepository).findById(1L);
        verify(socialShareRepository).save(any(SocialShare.class));
        // No se verifica límite para usuarios premium
        verify(socialShareRepository, never()).countUserSharesSince(any(), any());
    }

    @Test
    @DisplayName("Usuario gratuito dentro del límite - Debería compartir exitosamente")
    void shareSong_WithFreeUserUnderLimit_ShouldShareSuccessfully() {
        // Given
        when(userRepository.findById(3L)).thenReturn(Optional.of(freeUser));
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(socialShareRepository.countUserSharesSince(eq(freeUser), any(LocalDateTime.class))).thenReturn(5L);
        when(socialShareRepository.save(any(SocialShare.class))).thenReturn(socialShare);

        // When
        SocialShareResponseDto result = socialService.shareSong(3L, shareRequestDto);

        // Then
        assertNotNull(result);
        verify(socialShareRepository).countUserSharesSince(eq(freeUser), any(LocalDateTime.class));
        verify(socialShareRepository).save(any(SocialShare.class));
    }

    @Test
    @DisplayName("Usuario gratuito excede límite - Debería lanzar IllegalStateException")
    void shareSong_WithFreeUserOverLimit_ShouldThrowIllegalStateException() {
        // Given
        when(userRepository.findById(3L)).thenReturn(Optional.of(freeUser));
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(socialShareRepository.countUserSharesSince(eq(freeUser), any(LocalDateTime.class))).thenReturn(10L);

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            socialService.shareSong(3L, shareRequestDto);
        });

        assertTrue(exception.getMessage().contains("Límite de 10 comparticiones por hora alcanzado"));
        verify(socialShareRepository, never()).save(any(SocialShare.class));
    }

    @Test
    @DisplayName("Compartir canción con usuario no existente - Debería lanzar ResourceNotFoundException")
    void shareSong_WithNonExistentUser_ShouldThrowResourceNotFoundException() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            socialService.shareSong(999L, shareRequestDto);
        });

        verify(socialShareRepository, never()).save(any(SocialShare.class));
    }

    @Test
    @DisplayName("Compartir canción no existente - Debería lanzar ResourceNotFoundException")
    void shareSong_WithNonExistentSong_ShouldThrowResourceNotFoundException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(songRepository.findById(999L)).thenReturn(Optional.empty());
        shareRequestDto.setSongId(999L);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            socialService.shareSong(1L, shareRequestDto);
        });

        verify(socialShareRepository, never()).save(any(SocialShare.class));
    }

    @Test
    @DisplayName("Compartir en diferentes plataformas - Debería generar URLs correctas")
    void shareSong_WithDifferentPlatforms_ShouldGenerateCorrectUrls() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));
        when(socialShareRepository.save(any(SocialShare.class))).thenReturn(socialShare);

        // Test Twitter
        shareRequestDto.setPlatform("twitter");
        SocialShareResponseDto twitterResult = socialService.shareSong(1L, shareRequestDto);

        // Test WhatsApp
        shareRequestDto.setPlatform("whatsapp");
        SocialShareResponseDto whatsappResult = socialService.shareSong(1L, shareRequestDto);

        // Then
        assertNotNull(twitterResult);
        assertNotNull(whatsappResult);
        verify(socialShareRepository, times(2)).save(any(SocialShare.class));
    }

    @Test
    @DisplayName("Obtener comparticiones del usuario - Debería retornar comparticiones del usuario")
    void getUserShares_WithValidUser_ShouldReturnUserShares() {
        // Given
        List<SocialShare> shares = Arrays.asList(socialShare);
        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(socialShareRepository.findByUserOrderBySharedAtDesc(artistUser)).thenReturn(shares);

        // When
        List<SocialShareResponseDto> result = socialService.getUserShares(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getShareId());
        verify(socialShareRepository).findByUserOrderBySharedAtDesc(artistUser);
    }

    @Test
    @DisplayName("Obtener comparticiones de canción - Debería retornar comparticiones de la canción")
    void getSongShares_WithValidSong_ShouldReturnSongShares() {
        // Given
        List<SocialShare> shares = Arrays.asList(socialShare);
        when(songRepository.existsById(1L)).thenReturn(true);
        when(socialShareRepository.findBySong_IdSongOrderBySharedAtDesc(1L)).thenReturn(shares);

        // When
        List<SocialShareResponseDto> result = socialService.getSongShares(1L);

        // Then
        assertEquals(1, result.size());
        verify(socialShareRepository).findBySong_IdSongOrderBySharedAtDesc(1L);
    }

    @Test
    @DisplayName("Obtener contador de comparticiones - Debería retornar contador")
    void getSongShareCount_WithValidSong_ShouldReturnCount() {
        // Given
        when(songRepository.existsById(1L)).thenReturn(true);
        when(socialShareRepository.countSharesBySong(1L)).thenReturn(5L);

        // When
        Long result = socialService.getSongShareCount(1L);

        // Then
        assertEquals(5L, result);
        verify(socialShareRepository).countSharesBySong(1L);
    }

    @Test
    @DisplayName("Actualizar perfiles sociales con datos válidos - Debería actualizar exitosamente")
    void updateSocialProfiles_WithValidData_ShouldUpdateSuccessfully() {
        // Given
        SocialProfileRequestDto profileDto = SocialProfileRequestDto.builder()
                .facebookUrl("https://www.facebook.com/testuser")
                .twitterUrl("https://www.twitter.com/testuser")
                .instagramUrl("https://www.instagram.com/testuser")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(userRepository.save(any(User.class))).thenReturn(artistUser);

        // When
        UserResponseDto result = socialService.updateSocialProfiles(1L, profileDto);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getIdUser());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Conectar red social con artista y credenciales válidas - Debería conectar exitosamente")
    void connectSocialNetwork_WithValidArtistAndCredentials_ShouldConnectSuccessfully() {
        // Given
        SocialConnectRequestDto connectDto = SocialConnectRequestDto.builder()
                .platform("instagram")
                .credentials("testartist")
                .profileUrl("https://www.instagram.com/testartist")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));
        when(userRepository.save(any(User.class))).thenReturn(artistUser);

        // When
        SocialConnectResponseDto result = socialService.connectSocialNetwork(1L, connectDto);

        // Then
        assertNotNull(result);
        assertEquals("instagram", result.getPlatform());
        assertEquals("connected", result.getStatus());
        assertEquals("Red social vinculada exitosamente", result.getMessage());
        assertTrue(result.getIsActive());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Conectar red social con usuario no artista - Debería lanzar IllegalArgumentException")
    void connectSocialNetwork_WithNonArtistUser_ShouldThrowIllegalArgumentException() {
        // Given
        SocialConnectRequestDto connectDto = SocialConnectRequestDto.builder()
                .platform("instagram")
                .credentials("testuser")
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(listenerUser));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            socialService.connectSocialNetwork(2L, connectDto);
        });

        assertTrue(exception.getMessage().contains("Solo los artistas pueden vincular redes sociales"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Conectar red social con credenciales inválidas - Debería lanzar IllegalArgumentException")
    void connectSocialNetwork_WithInvalidCredentials_ShouldThrowIllegalArgumentException() {
        // Given
        SocialConnectRequestDto connectDto = SocialConnectRequestDto.builder()
                .platform("twitter")
                .credentials("") // Credenciales vacías
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            socialService.connectSocialNetwork(1L, connectDto);
        });

        assertEquals("Ingrese las credenciales correctas", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Generar enlace de compartir con canción válida - Debería generar enlace completo")
    void generateShareLink_WithValidSong_ShouldGenerateCompleteLink() {
        // Given
        when(songRepository.findById(1L)).thenReturn(Optional.of(song));

        // When
        SongShareLinkDto result = socialService.generateShareLink(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getSongId());
        assertEquals("Test Song", result.getSongTitle());
        assertEquals("Test Artist", result.getArtistName());
        assertEquals("https://example.com/cover.jpg", result.getCoverImageUrl());
        assertEquals("http://localhost:8080/songs/1", result.getShareUrl());
        assertTrue(result.getShareText().contains("Test Song"));

        assertNotNull(result.getMetadata());
        assertEquals("Test Song", result.getMetadata().getTitle());
        assertEquals("Test Artist", result.getMetadata().getArtist());
        assertEquals("Rock", result.getMetadata().getGenre());
        assertEquals(180, result.getMetadata().getDuration());
    }

    @Test
    @DisplayName("Verificar si usuario puede compartir - Usuario premium debería poder")
    void canUserShare_WithPremiumUser_ShouldReturnTrue() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(artistUser));

        // When
        boolean result = socialService.canUserShare(1L);

        // Then
        assertTrue(result);
        verify(socialShareRepository, never()).countUserSharesSince(any(), any());
    }

    @Test
    @DisplayName("Usuario gratuito dentro del límite - Debería poder compartir")
    void canUserShare_WithFreeUserUnderLimit_ShouldReturnTrue() {
        // Given
        when(userRepository.findById(3L)).thenReturn(Optional.of(freeUser));
        when(socialShareRepository.countUserSharesSince(eq(freeUser), any(LocalDateTime.class))).thenReturn(5L);

        // When
        boolean result = socialService.canUserShare(3L);

        // Then
        assertTrue(result);
        verify(socialShareRepository).countUserSharesSince(eq(freeUser), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Usuario gratuito excede límite - No debería poder compartir")
    void canUserShare_WithFreeUserOverLimit_ShouldReturnFalse() {
        // Given
        when(userRepository.findById(3L)).thenReturn(Optional.of(freeUser));
        when(socialShareRepository.countUserSharesSince(eq(freeUser), any(LocalDateTime.class))).thenReturn(10L);

        // When
        boolean result = socialService.canUserShare(3L);

        // Then
        assertFalse(result);
        verify(socialShareRepository).countUserSharesSince(eq(freeUser), any(LocalDateTime.class));
    }
}

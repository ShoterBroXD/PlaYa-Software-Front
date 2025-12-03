package com.playa.unit;

import com.playa.dto.NotificationRequestDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Follow;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import com.playa.repository.FollowRepository;
import com.playa.repository.UserRepository;
import com.playa.service.FollowService;
import com.playa.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FollowService followService;

    @Test
    @DisplayName("Debe crear un registro de seguimiento y notificar al artista")
    void followArtist_validData_createsFollowAndNotification() {
        // Arrange
        User follower = User.builder()
                .idUser(1L)
                .name("Carlos Pérez")
                .email("carlos@example.com")
                .password("123456")
                .type(Rol.LISTENER)
                .premium(true)
                .redSocial("@carlosp")
                .idgenre(1L)
                .favoriteGenres(null)
                .build();

        User Artist = User.builder()
                .idUser(2L)
                .name("Artista 1")
                .email("artista1@playa.com")
                .password("123456")
                .type(Rol.ARTIST)
                .premium(true)
                .redSocial("@artista1")
                .idgenre(1L)
                .favoriteGenres(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(follower));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(Artist));
        when(followRepository.existsByFollowerAndArtist(follower, Artist)).thenReturn(false);

        // Act
        String result = followService.followArtist(1L, 2L);

        // Assert
        assertEquals("Has comenzado a seguir a Artista 1", result);
        verify(followRepository).save(any(Follow.class));
        verify(notificationService).createNotification(any(NotificationRequestDto.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción si el artista no existe")
    void followArtist_artistNotFound_throwsException() {
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new User()));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> followService.followArtist(1L, 2L));
    }

    @Test
    @DisplayName("Debe retornar mensaje si ya existe la relación de seguimiento")
    void followArtist_alreadyFollowing_returnsMessage() {
        User follower = User.builder().build();
        User Artist = User.builder().build();
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(follower));
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(Artist));
        when(followRepository.existsByFollowerAndArtist(follower, Artist)).thenReturn(true);

        String result = followService.followArtist(1L, 2L);

        assertEquals("Ya sigues a este artista", result);
        verify(notificationService, never()).createNotification(any());
    }
}

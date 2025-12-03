package com.playa.unit;

import com.playa.dto.NotificationPreferenceRequestDto;
import com.playa.dto.NotificationRequestDto;
import com.playa.dto.NotificationResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.NotificationMapper;
import com.playa.model.Notification;
import com.playa.model.NotificationPreference;
import com.playa.model.User;
import com.playa.repository.NotificationPreferenceRepository;
import com.playa.repository.NotificationRepository;
import com.playa.repository.UserRepository;
import com.playa.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationsService - Pruebas Unitarias US-007")
class NotificationsServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationPreferenceRepository notificationPreferenceRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("CP-023 crear una notificación correctamente cuando el usuario existe")
    void createNotification_validUser_notificationCreated() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        NotificationRequestDto request = new NotificationRequestDto();
        request.setIdUser(1L);
        request.setContent("Nueva canción publicada");
        request.setType("COMMENT");

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setContent("Nueva canción publicada");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationMapper.convertToEntity(request)).thenReturn(notification);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.convertToResponseDto(notification))
                .thenReturn(new NotificationResponseDto());

        // Act
        NotificationResponseDto response = notificationService.createNotification(request);

        // Assert
        assertNotNull(response);
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("usuario no existe al crear notificación")
    void createNotification_userNotFound_throwsException() {
        NotificationRequestDto request = new NotificationRequestDto();
        request.setIdUser(99L);
        request.setContent("Mensaje de prueba");

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.createNotification(request));

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("usuario no tiene notificaciones")
    void getUserNotifications_noNotifications_returnsEmptyList() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserOrderByDateDesc(user.getIdUser())).thenReturn(List.of());

        // Act
        var result = notificationService.getUserNotifications(1L, false);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(notificationRepository, times(1)).findByUserOrderByDateDesc(user.getIdUser());
    }

    @Test
    @DisplayName("marcar como leída ")
    void markAsRead_validNotification_updatesReadStatus() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        Notification notification = new Notification();
        notification.setIdNotification(10L);
        notification.setUser(user);
        notification.setRead(false);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        // Act
        notificationService.markAsRead(10L, 1L);

        // Assert
        assertTrue(notification.getRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    @DisplayName("notificación no pertenece al usuario")
    void markAsRead_invalidUser_throwsException() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        Notification notification = new Notification();
        notification.setIdNotification(10L);
        notification.setUser(user);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> notificationService.markAsRead(10L, 2L));

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("CP-024 Configurar las preferencias de notificación correctamente")
    void setPreferences_validUser_updatesPreferences() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        NotificationPreference existingPreference = new NotificationPreference();
        existingPreference.setIdpreference(1L);
        existingPreference.setUser(user);
        existingPreference.setEnableComments(true);
        existingPreference.setEnableSystems(true);
        existingPreference.setEnableNewReleases(true);
        existingPreference.setEnableFollowers(true);

        NotificationPreferenceRequestDto request = new NotificationPreferenceRequestDto();
        request.setEnableComments(false);
        request.setEnableSystems(true);
        request.setEnableNewReleases(false);
        request.setEnableFollowers(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPreferenceRepository.findByUser(user)).thenReturn(existingPreference);
        when(notificationPreferenceRepository.save(any(NotificationPreference.class)))
                .thenReturn(existingPreference);

        // Act
        notificationService.setpreferences(1L, request);

        // Assert
        assertFalse(existingPreference.getEnableComments());
        assertTrue(existingPreference.getEnableSystems());
        assertFalse(existingPreference.getEnableNewReleases());
        assertTrue(existingPreference.getEnableFollowers());
        verify(notificationPreferenceRepository, times(1)).save(existingPreference);
    }

    @Test
    @DisplayName("Debe crear nuevas preferencias si el usuario no las tiene")
    void setPreferences_noExistingPreferences_createsNew() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        NotificationPreferenceRequestDto request = new NotificationPreferenceRequestDto();
        request.setEnableComments(false);
        request.setEnableSystems(true);
        request.setEnableNewReleases(false);
        request.setEnableFollowers(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPreferenceRepository.findByUser(user)).thenReturn(null);
        when(notificationPreferenceRepository.save(any(NotificationPreference.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        notificationService.setpreferences(1L, request);

        // Assert
        verify(notificationPreferenceRepository, times(1)).save(argThat(pref ->
                pref.getUser().equals(user) &&
                        !pref.getEnableComments() &&
                        pref.getEnableSystems() &&
                        !pref.getEnableNewReleases() &&
                        pref.getEnableFollowers()
        ));
    }

    @Test
    @DisplayName("Debe lanzar excepción si el usuario no existe al actualizar preferencias")
    void setPreferences_userNotFound_throwsException() {
        // Arrange
        NotificationPreferenceRequestDto request = new NotificationPreferenceRequestDto();
        request.setEnableComments(false);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.setpreferences(99L, request));

        verify(notificationPreferenceRepository, never()).save(any());
    }

    @Test
    @DisplayName("CP-025 Desactivar todas las notificaciones y guardar estado previo")
    void togglePreferences_existingPreferences_disablesAllAndSavesPreviousState() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        NotificationPreference preference = new NotificationPreference();
        preference.setIdpreference(1L);
        preference.setUser(user);
        preference.setEnableComments(true);
        preference.setEnableSystems(true);
        preference.setEnableNewReleases(false);
        preference.setEnableFollowers(true);
        preference.setAllDisabled(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPreferenceRepository.findByUser(user)).thenReturn(preference);
        when(notificationPreferenceRepository.save(any(NotificationPreference.class)))
                .thenReturn(preference);

        // Act
        notificationService.togglePreferences(1L);

        assertFalse(preference.getEnableComments(), "Comments debe estar desactivado");
        assertFalse(preference.getEnableSystems(), "Systems debe estar desactivado");
        assertFalse(preference.getEnableNewReleases(), "NewReleases debe estar desactivado");
        assertFalse(preference.getEnableFollowers(), "Followers debe estar desactivado");
        assertTrue(preference.getAllDisabled(), "allDisabled debe ser true");

        assertTrue(preference.getPrevEnableComments(), "Debe guardar estado previo de Comments");
        assertTrue(preference.getPrevEnableSystems(), "Debe guardar estado previo de Systems");
        assertFalse(preference.getPrevEnableNewReleases(), "Debe guardar estado previo de NewReleases");
        assertTrue(preference.getPrevEnableFollowers(), "Debe guardar estado previo de Followers");

        verify(notificationPreferenceRepository, times(1)).save(preference);
    }

    @Test
    @DisplayName("Restaurar estado previo al volver a hacer toggle")
    void togglePreferences_allDisabled_restoresPreviousState() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        NotificationPreference preference = new NotificationPreference();
        preference.setIdpreference(1L);
        preference.setUser(user);
        // Estado actual: todo desactivado
        preference.setEnableComments(false);
        preference.setEnableSystems(false);
        preference.setEnableNewReleases(false);
        preference.setEnableFollowers(false);
        preference.setAllDisabled(true); // Marca que están todas desactivadas
        // Estado previo guardado
        preference.setPrevEnableComments(true);
        preference.setPrevEnableSystems(false);
        preference.setPrevEnableNewReleases(true);
        preference.setPrevEnableFollowers(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPreferenceRepository.findByUser(user)).thenReturn(preference);
        when(notificationPreferenceRepository.save(any(NotificationPreference.class)))
                .thenReturn(preference);

        // Act
        notificationService.togglePreferences(1L);

        // Assert - Segunda llamada: restaura el estado previo
        assertTrue(preference.getEnableComments(), "Debe restaurar Comments a true");
        assertFalse(preference.getEnableSystems(), "Debe restaurar Systems a false");
        assertTrue(preference.getEnableNewReleases(), "Debe restaurar NewReleases a true");
        assertFalse(preference.getEnableFollowers(), "Debe restaurar Followers a false");
        assertFalse(preference.getAllDisabled(), "allDisabled debe ser false");

        // Verifica que limpió el estado previo
        assertNull(preference.getPrevEnableComments(), "Debe limpiar estado previo de Comments");
        assertNull(preference.getPrevEnableSystems(), "Debe limpiar estado previo de Systems");
        assertNull(preference.getPrevEnableNewReleases(), "Debe limpiar estado previo de NewReleases");
        assertNull(preference.getPrevEnableFollowers(), "Debe limpiar estado previo de Followers");

        verify(notificationPreferenceRepository, times(1)).save(preference);
    }

    @Test
    @DisplayName("Crear preferencias con valores activos si no existen")
    void togglePreferences_noExistingPreferences_createsWithActiveDefaults() {
        // Arrange
        User user = new User();
        user.setIdUser(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPreferenceRepository.findByUser(user)).thenReturn(null);
        when(notificationPreferenceRepository.save(any(NotificationPreference.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        notificationService.togglePreferences(1L);

        // Assert - Primera vez sin preferencias: crea todo activo
        verify(notificationPreferenceRepository, times(1)).save(argThat(pref ->
                pref.getUser().equals(user) &&
                        pref.getEnableComments() &&      // Debe ser true
                        pref.getEnableSystems() &&       // Debe ser true
                        pref.getEnableNewReleases() &&   // Debe ser true
                        pref.getEnableFollowers() &&     // Debe ser true
                        !pref.getAllDisabled()           // Debe ser false
        ));
    }

    @Test
    @DisplayName("excepción si el usuario no existe al hacer toggle")
    void togglePreferences_userNotFound_throwsException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.togglePreferences(99L));

        verify(notificationPreferenceRepository, never()).save(any());
    }


}

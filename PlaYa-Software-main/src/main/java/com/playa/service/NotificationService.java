package com.playa.service;

import com.playa.dto.NotificationPreferenceRequestDto;
import com.playa.dto.NotificationPreferenceResponseDto;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final NotificationMapper notificationMapper;

    @Transactional
    public NotificationResponseDto createNotification(NotificationRequestDto notificationRequestDto) {
        User user= userRepository.findById(notificationRequestDto.getIdUser())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar las preferencias del usuario antes de crear la notificación
        NotificationPreference preference = notificationPreferenceRepository.findByUser(user);

        if (preference != null) {
            String type = notificationRequestDto.getType();

            if ("COMMENT".equalsIgnoreCase(type) && !preference.getEnableComments()) {
                return null; // No crear notificación si los comentarios están deshabilitados
            }
            if ("FOLLOWER".equalsIgnoreCase(type) && !preference.getEnableFollowers()) {
                return null; // No crear notificación si los seguidores están deshabilitados
            }
            if ("SYSTEM".equalsIgnoreCase(type) && !preference.getEnableSystems()) {
                return null; // No crear notificación si las del sistema están deshabilitadas
            }
            if ("NEW_RELEASE".equalsIgnoreCase(type) && !preference.getEnableNewReleases()) {
                return null; // No crear notificación si los nuevos lanzamientos están deshabilitados
            }
        }

        Notification notification = notificationMapper.convertToEntity(notificationRequestDto);
        notification.setUser(user);
        notification.setContent(notificationRequestDto.getContent());
        notification.setRead(notificationRequestDto.getRead());
        notification.setDate(LocalDateTime.now());

        notificationRepository.save(notification);
        return notificationMapper.convertToResponseDto(notification);
    }

    @Transactional
    public void markAsRead(Long idNotification,Long idUser) {
        Notification notification = notificationRepository.findById(idNotification)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada "));

        if(!notification.getUser().getIdUser().equals(idUser)){
            throw new IllegalArgumentException("Notificación no pertenece al usuario especificado");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUserNotifications(Long userId, Boolean unreadOnly) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserAndReadFalseOrderByDateDesc(user)
                : notificationRepository.findByUserOrderByDateDesc(user.getIdUser());

        return notifications.stream()
                .map(notificationMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUnreadNotificationsByUser(Long idUser) {
        List<Notification> notifications = notificationRepository.findByUserIdUserAndReadFalseOrderByDateDesc(idUser);
        return notifications.stream()
                .map(notificationMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notificación no encontrada con ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long idUser) {
        return notificationRepository.countByUserIdUserAndRead(idUser, false);
    }


    @Transactional
    public void setpreferences(Long idUser, NotificationPreferenceRequestDto request) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        NotificationPreference preference = notificationPreferenceRepository.findByUser(user);

        if (preference == null) {
            preference = NotificationPreference.builder()
                    .user(user)
                    .enableComments(request.getEnableComments())      // Sin 'd'
                    .enableSystems(request.getEnableSystems())
                    .enableNewReleases(request.getEnableNewReleases())
                    .enableFollowers(request.getEnableFollowers())
                    .build();
        } else {
            preference.setEnableComments(request.getEnableComments());
            preference.setEnableSystems(request.getEnableSystems());
            preference.setEnableNewReleases(request.getEnableNewReleases());
            preference.setEnableFollowers(request.getEnableFollowers());
        }

        notificationPreferenceRepository.save(preference);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponseDto getPreferences(Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        NotificationPreference preference = notificationPreferenceRepository.findByUser(user);

        if (preference == null) {
            return NotificationPreferenceResponseDto.builder()
                    .enableComments(true)
                    .enableSystems(true)
                    .enableNewReleases(true)
                    .enableFollowers(true)
                    .build();
        }

        return NotificationPreferenceResponseDto.builder()
                .enableComments(preference.getEnableComments())
                .enableSystems(preference.getEnableSystems())
                .enableNewReleases(preference.getEnableNewReleases())
                .enableFollowers(preference.getEnableFollowers())
                .build();
    }

    @Transactional
    public void markAllAsRead(Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Notification> unreadNotifications = notificationRepository.findByUserAndReadFalseOrderByDateDesc(user);

        unreadNotifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void togglePreferences(Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        NotificationPreference preference = notificationPreferenceRepository.findByUser(user);

        if (preference == null) {
            preference = NotificationPreference.builder()
                    .user(user)
                    .enableComments(true)
                    .enableSystems(true)
                    .enableNewReleases(true)
                    .enableFollowers(true)
                    .allDisabled(false)
                    .build();
        } else {
            if (preference.getAllDisabled()) {
                preference.setEnableComments(preference.getPrevEnableComments() != null ? preference.getPrevEnableComments() : true);
                preference.setEnableSystems(preference.getPrevEnableSystems() != null ? preference.getPrevEnableSystems() : true);
                preference.setEnableNewReleases(preference.getPrevEnableNewReleases() != null ? preference.getPrevEnableNewReleases() : true);
                preference.setEnableFollowers(preference.getPrevEnableFollowers() != null ? preference.getPrevEnableFollowers() : true);

                preference.setPrevEnableComments(null);
                preference.setPrevEnableSystems(null);
                preference.setPrevEnableNewReleases(null);
                preference.setPrevEnableFollowers(null);
                preference.setAllDisabled(false);
            } else {
                preference.setPrevEnableComments(preference.getEnableComments());
                preference.setPrevEnableSystems(preference.getEnableSystems());
                preference.setPrevEnableNewReleases(preference.getEnableNewReleases());
                preference.setPrevEnableFollowers(preference.getEnableFollowers());

                // Desactivar todas las notificaciones
                preference.setEnableComments(false);
                preference.setEnableSystems(false);
                preference.setEnableNewReleases(false);
                preference.setEnableFollowers(false);
                preference.setAllDisabled(true);
            }
        }

        notificationPreferenceRepository.save(preference);
    }
}

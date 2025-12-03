package com.playa.mapper;

import com.playa.dto.NotificationRequestDto;
import com.playa.dto.NotificationResponseDto;
import com.playa.model.Notification;
import com.playa.model.User;
import com.playa.model.enums.Category;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    private final UserRepository userRepository;

    public Notification convertToEntity(NotificationRequestDto requestDto) {
        User user = userRepository.findById(requestDto.getIdUser())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        return Notification.builder()
                .user(user)
                .content(requestDto.getContent())
                .date(requestDto.getDate())
                .read(requestDto.getRead() != null ? requestDto.getRead() : false)
                .type(requestDto.getType() != null ? Category.valueOf(requestDto.getType().toUpperCase()) :  null)
                .build();
    }

    public NotificationResponseDto convertToResponseDto(Notification notification) {
        return NotificationResponseDto.builder()
                .idNotification(notification.getIdNotification())
                .content(notification.getContent())
                .read(notification.getRead())
                .date(notification.getDate())
                .type(notification.getType())
                .build();
    }
}

package com.playa.service;

import com.playa.dto.ThreadRequestDto;
import com.playa.dto.ThreadResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.repository.CommunityRepository;
import com.playa.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.playa.repository.ThreadRepository;
import com.playa.model.Thread;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ThreadService {

    private final ThreadRepository threadRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    public ThreadService(ThreadRepository threadRepository, UserRepository userRepository, CommunityRepository communityRepository) {
        this.threadRepository = threadRepository;
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
    }

    // Métodos de lógica de negocio para hilos

    @Transactional
    public ThreadResponseDto createThread(ThreadRequestDto dto) {
        if (dto.getIdUser() == null || dto.getIdCommunity() == null || dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Los campos idUser, idCommunity y title son obligatorios");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("El campo content es obligatorio");
        }
        if (!userRepository.existsById(dto.getIdUser())) {
            throw new IllegalArgumentException("El usuario con ID " + dto.getIdUser() + " no existe");
        }
        if (!communityRepository.existsById(dto.getIdCommunity())) {
            throw new IllegalArgumentException("La comunidad con ID " + dto.getIdCommunity() + " no existe");
        }

        Thread thread = new Thread();
        thread.setIdUser(dto.getIdUser());
        thread.setIdCommunity(dto.getIdCommunity());
        thread.setTitle(dto.getTitle().trim());
        thread.setContent(dto.getContent().trim());
        thread.setCreationDate(LocalDateTime.now());
        Thread saved = threadRepository.save(thread);
        return toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public ThreadResponseDto getThread(Long id) {
        return threadRepository.findById(id)
            .map(this::toResponseDto)
            .orElseThrow(()-> new ResourceNotFoundException("El hilo no existe"));
    }

    private ThreadResponseDto toResponseDto(Thread thread) {
        ThreadResponseDto dto = new ThreadResponseDto();
        dto.setIdThread(thread.getIdThread());
        dto.setIdUser(thread.getIdUser());
        dto.setIdCommunity(thread.getIdCommunity());
        dto.setTitle(thread.getTitle());
        dto.setContent(thread.getContent());
        dto.setCreationDate(thread.getCreationDate());
        return dto;
    }
}

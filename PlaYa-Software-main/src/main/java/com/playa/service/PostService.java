package com.playa.service;

import com.playa.dto.PostRequestDto;
import com.playa.dto.PostResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Post;
import com.playa.repository.ThreadRepository;
import org.springframework.stereotype.Service;
import com.playa.repository.PostRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final ThreadRepository threadRepository;

    // Métodos de lógica de negocio para posts

    @Transactional
    public PostResponseDto createPost(PostRequestDto dto) {
        if (dto.getIdThread() == null || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Los campos idThread y content son obligatorios");
        }
        if (!threadRepository.existsById(dto.getIdThread())) {
            throw new IllegalArgumentException("El hilo con ID " + dto.getIdThread() + " no existe");
        }

        Post post = new Post();
        post.setIdThread(dto.getIdThread());
        post.setContent(dto.getContent().trim());
        post.setVisible(true); // Inicializar como visible por defecto
        post.setPostDate(LocalDateTime.now()); // Establecer fecha actual

        Post saved = postRepository.save(post);
        return toResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public PostResponseDto getPost(Long id) {
        return postRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(()-> new ResourceNotFoundException("El post no existe."));
    }

    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .filter(post -> post.getVisible()) // Filtrar solo posts visibles
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByThread(Long threadId) {
        List<Post> posts = postRepository.findByIdThread(threadId);
        return posts.stream()
                .filter(post -> post.getVisible()) // Filtrar solo posts visibles
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El post no existe."));
        postRepository.delete(post);
    }

    @Transactional
    public void reportPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El post no existe"));
        post.setVisible(false);
        postRepository.save(post);
    }

    @Transactional
    public void unreportPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El post no existe"));
        post.setVisible(true);
        postRepository.save(post);
    }

    private PostResponseDto toResponseDto(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setIdPost(post.getIdPost());
        dto.setIdThread(post.getIdThread());
        dto.setContent(post.getContent());
        return dto;
    }
}

package com.playa.controller;

import com.playa.dto.PostRequestDto;
import com.playa.dto.PostResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.playa.service.PostService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // POST /api/v1/posts - Crear post en hilo
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(@RequestBody PostRequestDto dto) {
        PostResponseDto response = postService.createPost(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/posts - Obtener todos los posts
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        List<PostResponseDto> posts = postService.getAllPosts();
        if (posts.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(posts); // 200
    }

    // GET /api/v1/posts/thread/{threadId} - Obtener posts de un hilo
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<List<PostResponseDto>> getPostsByThread(@PathVariable Long threadId) {
        List<PostResponseDto> posts = postService.getPostsByThread(threadId);
        if (posts.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(posts); // 200
    }

    // GET /api/v1/posts/{id} - Obtener post por ID
    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long id) {
        PostResponseDto response = postService.getPost(id);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(response);
    }

    // POST /api/v1/posts/{id}/report - Reportar/ocultar post
    @PostMapping("/{id}/report")
    public ResponseEntity<String> reportPost(@PathVariable Long id) {
        postService.reportPost(id);
        return ResponseEntity.ok("Post reportado y ocultado exitosamente");
    }

    // POST /api/v1/posts/{id}/unreport - Mostrar post reportado
    @PostMapping("/{id}/unreport")
    public ResponseEntity<String> unreportPost(@PathVariable Long id) {
        postService.unreportPost(id);
        return ResponseEntity.ok("Post habilitado exitosamente");
    }

    // DELETE /api/v1/posts/{id} - Eliminar post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}

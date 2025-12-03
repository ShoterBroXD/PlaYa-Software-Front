package com.playa.controller;

import com.playa.dto.ThreadRequestDto;
import com.playa.dto.ThreadResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.playa.service.ThreadService;

@RestController
@RequestMapping("/threads")
public class ThreadController {

    private final ThreadService threadService;

    public ThreadController(ThreadService threadService) {
        this.threadService = threadService;
    }

    // POST /api/v1/threads - Crear hilo en comunidad
    @PostMapping
    public ResponseEntity<ThreadResponseDto> createThread(@RequestBody ThreadRequestDto threadRequestDto) {
        ThreadResponseDto threadResponse = threadService.createThread(threadRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(threadResponse);
    }

    // GET /api/v1/threads/{id} - Ver hilo
    @GetMapping("/{id}")
    public ResponseEntity<ThreadResponseDto> getThread(@PathVariable Long id) {
        ThreadResponseDto threadResponse = threadService.getThread(id);
        if (threadResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(threadResponse);
    }
}

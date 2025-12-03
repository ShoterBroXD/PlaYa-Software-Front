package com.playa.controller;

import com.playa.dto.CommunityRequestDto;
import com.playa.dto.CommunityResponseDto;
import com.playa.dto.JoinCommunityDto;
import com.playa.dto.UserResponseDto;
import com.playa.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    // POST /communities - Crear comunidad
    @PostMapping
    public ResponseEntity<CommunityResponseDto> createCommunity(@Valid @RequestBody CommunityRequestDto requestDto) {
        CommunityResponseDto responseDto = communityService.createCommunity(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // GET /communities/{id} - Ver comunidad
    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponseDto> getCommunityById(@PathVariable Long id) {
        CommunityResponseDto responseDto = communityService.getCommunityById(id);
        return ResponseEntity.ok(responseDto);
    }

    // POST /communities/{id}/users - Unirse a comunidad
    @PostMapping("/{id}/users")
    public ResponseEntity<String> joinCommunity(
            @PathVariable Long id,
            @Valid @RequestBody JoinCommunityDto requestDto) {
        try {
            communityService.joinCommunity(id, requestDto);
            return ResponseEntity.ok("Usuario unido a la comunidad exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // GET /communities/{id}/users - Listar miembros
    @GetMapping("/{id}/users")
    public ResponseEntity<List<UserResponseDto>> getCommunityMembers(@PathVariable Long id) {
        List<UserResponseDto> members = communityService.getCommunityMembers(id);
        return ResponseEntity.ok(members);
    }

    // GET /communities - Obtener todas las comunidades
    @GetMapping
    public ResponseEntity<List<CommunityResponseDto>> getAllCommunities() {
        List<CommunityResponseDto> communities = communityService.getAllCommunities();
        return ResponseEntity.ok(communities);
    }

    // DELETE /communities/{id} - Eliminar comunidad
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCommunity(@PathVariable Long id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.ok("Comunidad eliminada exitosamente");
    }
}
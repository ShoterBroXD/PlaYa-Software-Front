package com.playa.controller;

import com.playa.dto.*;
import com.playa.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/player")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @PostMapping("/play")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> registerPlay(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody PlayHistoryRequestDto request) {
        playerService.registerPlay(userId, request.getIdSong());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<List<SongResponseDto>> getHistory(
            @RequestHeader("iduser") Long userId) {
        List<SongResponseDto> history = playerService.getPlayHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/extended")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<List<HistoryResponseDto>> getExtendedHistory(
            @RequestHeader("iduser") Long userId,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        List<HistoryResponseDto> history = playerService.getHistory(userId, limit);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrentPlaybackResponseDto> getCurrentPlayback(
            @RequestHeader("iduser") Long userId) {
        CurrentPlaybackResponseDto response = playerService.getCurrentPlayback(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/play/song")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<PlaybackControlResponseDto> playSong(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody PlaySongRequestDto request) {
        PlaybackControlResponseDto response = playerService.playSong(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/pause")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<PlaybackControlResponseDto> pause(
            @RequestHeader("iduser") Long userId) {
        PlaybackControlResponseDto response = playerService.pause(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlaybackControlResponseDto> resume(
            @RequestHeader("iduser") Long userId) {
        PlaybackControlResponseDto response = playerService.resume(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/stop")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<PlaybackControlResponseDto> stop(
            @RequestHeader("iduser") Long userId) {
        PlaybackControlResponseDto response = playerService.stop(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/seek")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> seekTo(
            @RequestHeader("idUser") Long idUser,
            @Valid @RequestBody SeekRequestDto request) {
        Map<String, Object> response = playerService.seekTo(idUser, request);
        return ResponseEntity.ok(response);
    }


    @PutMapping("/next")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<PlaybackControlResponseDto> next(
            @RequestHeader("iduser") Long userId) {
        PlaybackControlResponseDto response = playerService.next(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/previous")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<PlaybackControlResponseDto> previous(
            @RequestHeader("iduser") Long userId) {
        PlaybackControlResponseDto response = playerService.previous(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/shuffle")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Map<String, Object>> setShuffle(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody ShuffleRequestDto request) {
        Map<String, Object> response = playerService.setShuffle(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/repeat")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Map<String, Object>> setRepeatMode(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody RepeatModeRequestDto request) {
        Map<String, Object> response = playerService.setRepeatMode(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/volume")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Map<String, Object>> setVolume(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody VolumeRequestDto request) {
        Map<String, Object> response = playerService.setVolume(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/queue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QueueResponseDto> getQueue(
            @RequestHeader("iduser") Long userId) {
        QueueResponseDto response = playerService.getQueue(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/queue")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Map<String, Object>> addToQueue(
            @RequestHeader("iduser") Long userId,
            @Valid @RequestBody AddToQueueRequestDto request) {
        Map<String, Object> response = playerService.addToQueue(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/queue/{position}")
    @PreAuthorize("hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Void> removeFromQueue(
            @RequestHeader("iduser") Long userId,
            @PathVariable Integer position) {
        playerService.removeFromQueue(userId, position);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecommendationResponseDto>> getRecommendations(
            @RequestHeader("iduser") Long userId) {
        List<RecommendationResponseDto> recommendations = playerService.getRecommendations(userId);
        return ResponseEntity.ok(recommendations);
    }

    //@GetMapping("/test")
    //public String test() {
    //    return "PlayerController funcionando correctamente";
    //}

}
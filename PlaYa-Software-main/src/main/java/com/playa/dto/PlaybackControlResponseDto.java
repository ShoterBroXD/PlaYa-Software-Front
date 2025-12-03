package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackControlResponseDto {

    private String message;
    private Boolean isPlaying;
    private Boolean isPaused;
    private SongResponseDto song; // Solo si hay cambio de canción
}
package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueResponseDto {

    private Integer currentIndex; // Posición actual en la cola
    private Integer totalSongs;
    private List<QueueSongResponseDto> songs;
}
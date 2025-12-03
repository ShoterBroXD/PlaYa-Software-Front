package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResponseDto {

    private SongResponseDto song;
    private LocalDateTime playedAt;
}
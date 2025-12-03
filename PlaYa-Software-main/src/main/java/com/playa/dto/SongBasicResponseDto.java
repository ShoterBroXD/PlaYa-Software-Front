package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongBasicResponseDto {
    private Long idSong;
    private String title;
    private String artistName;
    private String coverURL;
    private Float duration; // en segundos
}
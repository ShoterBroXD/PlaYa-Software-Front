package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDto {

    private Long idSong;
    private String title;
    private ArtistResponseDto artist;
    private String coverURL;
    private Set<GenreResponseDto> genres;
    private String reason; // "Basado en tu historial de Rock"
}
package com.playa.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArtistPopularityDto {
    private String artistName;
    private int popularityScore;
    private String trend; // "up", "down", "stable"
}

package com.playa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ArtistPopularityResponse {
    private Long artistId;
    private String artistName;
    private String genreName;
    private Long totalPlays;
}

package com.playa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArtistReportResponse {
    private Long artistId;
    private String artistName;
    private Long totalReproductions;
    private String topSongTitle;
    private Long topSongCount;
    private Double averagePlays;
    private List<SongPlayReportResponse> songStats;
}

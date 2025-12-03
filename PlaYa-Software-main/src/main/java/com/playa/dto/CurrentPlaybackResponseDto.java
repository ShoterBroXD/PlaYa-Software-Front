package com.playa.dto;

import com.playa.model.enums.Mode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentPlaybackResponseDto {

    private Long idSong;
    private String title;
    private ArtistResponseDto artist;
    private String coverURL;
    private String fileURL;
    private Boolean isPlaying;
    private Boolean isPaused;
    private Integer currentTime; // Segundos
    private Integer duration;    // Segundos (de la canción)
    private Integer volume;
    private Boolean shuffleEnabled;
    private Mode repeatMode; // none, one, all
}
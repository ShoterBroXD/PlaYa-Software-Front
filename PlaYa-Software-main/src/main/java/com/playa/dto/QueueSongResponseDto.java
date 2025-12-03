package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueSongResponseDto {

    private Integer position;
    private Long idSong;
    private String title;
    private ArtistResponseDto artist;
    private String coverURL;
    private Integer duration;
}
package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongShareLinkDto {

    private Long songId;
    private String songTitle;
    private String artistName;
    private String coverImageUrl;
    private String shareUrl;
    private String shareText;
    private SongMetadataDto metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongMetadataDto {
        private String title;
        private String artist;
        private String album;
        private String genre;
        private Integer duration;
        private String description;
        private String[] tags;
    }
}

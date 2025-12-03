package com.playa.dto;

import com.playa.model.Genre;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongResponseDto {

    private Long idSong;
    private Long idUser;
    private String title;
    private String description;
    private String coverURL;
    private String fileURL;
    private String visibility;
    private Float duration;
    private LocalDateTime uploadDate;
    private ArtistResponseDto artist;
    private Genre genre;
    private Double averageRating;
    private Integer ratingCount;

    //public SongResponseDto() {}

    //public SongResponseDto(Long idSong, Long idUser, String title, String description, String coverURL, String fileURL, String visibility, LocalDateTime uploadDate) {
    //    this.idSong = idSong;
    //    this.idUser = idUser;
    //    this.title = title;
    //    this.description = description;
    //    this.coverURL = coverURL;
    //    this.fileURL = fileURL;
    //    this.visibility = visibility;
    //    this.uploadDate = uploadDate;
    //}

}

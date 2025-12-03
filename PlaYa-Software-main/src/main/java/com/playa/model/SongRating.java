package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "song_rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongRating {

    @EmbeddedId
    private SongRatingId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSong")
    @JoinColumn(name = "idsong")
    private Song song;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUser")
    @JoinColumn(name = "iduser")
    private User user;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1..5

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}


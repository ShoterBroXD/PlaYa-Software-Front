package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "song_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongHistory {

    @EmbeddedId
    private SongHistoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUser")
    @JoinColumn(name = "iduser")
    private User user;

    @ManyToOne
    @MapsId("idSong")
    @JoinColumn(name = "idsong")
    private Song song;

    @Column(name = "date_played", nullable = false)
    private LocalDateTime datePlayed;

    public SongHistory(LocalDateTime datePlayed) {
        this.datePlayed=LocalDateTime.now();
    }
}
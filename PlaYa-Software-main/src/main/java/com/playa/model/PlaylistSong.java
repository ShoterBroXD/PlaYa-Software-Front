package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_song")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistSong {

    @EmbeddedId
    private PlaylistSongId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idplaylist", insertable = false, updatable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idsong", insertable = false, updatable = false)
    private Song song;

    @Column(name = "date")
    private LocalDateTime date;
}

package com.playa.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Setter
@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistSongId implements Serializable {

    @Column(name = "idplaylist")
    private Long idPlaylist;

    @Column(name = "idsong")
    private Long idSong;
}

package com.playa.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeId implements java.io.Serializable {
    @ManyToOne
    @JoinColumn(name = "idUser")
    private User user;

    @ManyToOne
    @JoinColumn(name = "idsong")
    private Song song;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LikeId likeId = (LikeId) o;
        return user.getIdUser().equals(likeId.user.getIdUser()) && song.getIdSong().equals(likeId.song.getIdSong());
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(user.getIdUser(), song.getIdSong());
    }
}

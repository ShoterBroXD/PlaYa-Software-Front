package com.playa.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongHistoryId implements java.io.Serializable {

    @Column(name = "idsong")
    private Long idSong;

    @Column(name = "iduser")
    private Long idUser;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SongHistoryId that = (SongHistoryId) o;
        return Objects.equals(idUser, that.idUser) && Objects.equals(idSong, that.idSong);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUser, idSong);
    }
}

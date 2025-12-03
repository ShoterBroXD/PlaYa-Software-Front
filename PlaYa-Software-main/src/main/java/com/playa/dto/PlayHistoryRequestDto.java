package com.playa.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlayHistoryRequestDto {

    @NotNull(message = "El ID de la canción es obligatorio")
    private Long idSong;

    public Long getIdSong() {
        return idSong;
    }

    public void setIdSong(Long idSong) {
        this.idSong = idSong;
    }
}
package com.playa.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToQueueRequestDto {

    @NotNull(message = "El ID de la canción es obligatorio")
    private Long idSong;
}
package com.playa.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaySongRequestDto {

    @NotNull(message = "El ID de la canción es obligatorio")
    private Long idSong;

    private String context;

    @JsonProperty("idcontext")
    private Long idcontext;

    @JsonProperty("idsqueue")
    private List<Long> idsqueue;
}
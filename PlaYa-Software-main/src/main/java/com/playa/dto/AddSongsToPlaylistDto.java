package com.playa.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSongsToPlaylistDto {

    @NotEmpty(message = "La lista de canciones no puede estar vacía")
    private List<Long> songIds;
}

package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistRequestDto {

    @NotNull
    private Long idUser;

    @NotBlank(message = "El nombre de la playlist es obligatorio")
    @Size(max = 150)
    private String name;

    @Size(max = 100)
    private String description;
}

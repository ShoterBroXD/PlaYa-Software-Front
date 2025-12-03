package com.playa.dto;

import com.playa.model.Genre;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongRequestDto {

    @NotBlank(message = "El título de la canción no puede estar vacío")
    @Size(max = 150, message = "El título de la canción no puede tener más de 150 caracteres")
    private String title;

    @Size(max = 100)
    private String description;

    @NotBlank(message = "La URL de la portada no puede estar vacía")
    private String coverURL;

    @NotBlank(message = "La URL del archivo no puede estar vacía")
    private String fileURL;

    @NotBlank
    @Pattern(regexp = "^(public|private|unlisted)$", message = "La visibilidad debe ser: public, private o unlisted")
    private String visibility="public";

    @NotNull(message = "Debe seleccionar un género")
    private Long idgenre;

    private Float duration; // Duración en segundos (opcional)

}

package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Setter
@Getter
public class CommentRequestDto {
    // Constructores, getters y setters
    @NotNull(message = "El ID de la canción es obligatorio")
    private Long idSong;

    @NotBlank(message = "El contenido del comentario no puede estar vacío")
    @Length(max = 500, message = "El comentario no puede tener más de 500 caracteres")
    private String content;

    private Long parentComment; // null si no es respuesta

}

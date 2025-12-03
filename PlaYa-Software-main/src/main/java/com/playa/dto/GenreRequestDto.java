package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenreRequestDto {

    @NotBlank(message = "El nombre del género no puede estar vacio")
    @Size(max = 150, message = "El nombre del género no puede tener más de 150 caracteres")
    public String name;

    public GenreRequestDto(String name) {
        this.name = name;
    }
}
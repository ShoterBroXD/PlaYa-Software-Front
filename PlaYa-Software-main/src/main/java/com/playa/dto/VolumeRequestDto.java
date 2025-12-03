package com.playa.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolumeRequestDto {

    @NotNull(message = "El volumen es obligatorio")
    @Min(value = 0, message = "El volumen mínimo es 0")
    @Max(value = 100, message = "El volumen máximo es 100")
    private Integer volume;
}
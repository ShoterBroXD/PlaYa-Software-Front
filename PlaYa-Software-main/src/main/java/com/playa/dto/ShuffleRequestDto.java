package com.playa.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShuffleRequestDto {

    @NotNull(message = "El estado de shuffle es obligatorio")
    private Boolean enabled;
}
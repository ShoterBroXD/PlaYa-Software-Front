package com.playa.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeekRequestDto {
    @NotNull
    @Min(0)
    private Integer time;
}

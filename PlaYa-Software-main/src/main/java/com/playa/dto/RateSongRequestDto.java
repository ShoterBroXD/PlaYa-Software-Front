package com.playa.dto;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class RateSongRequestDto {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
}


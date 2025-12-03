package com.playa.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenreResponseDto {
    private Long id;
    private String name;

    public GenreResponseDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}

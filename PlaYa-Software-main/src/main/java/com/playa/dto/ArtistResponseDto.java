package com.playa.dto;

import com.playa.model.Genre;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArtistResponseDto {
    private Long idUser;
    private String name;
    private String biography;

    private Genre genre;
}
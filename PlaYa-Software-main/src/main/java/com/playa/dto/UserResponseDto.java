package com.playa.dto;

import com.playa.model.enums.Rol;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
public class UserResponseDto {
    private Long idUser;
    private LocalDateTime registerDate;
    private String name;
    private String email;
    private Rol type;
    private String biography;
    private Boolean premium;
    private String redSocial;
    private List<String> favoriteGenres;
    private String language;
    private Boolean historyVisible;
}

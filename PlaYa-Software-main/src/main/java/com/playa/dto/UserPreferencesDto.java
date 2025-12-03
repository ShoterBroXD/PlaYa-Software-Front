package com.playa.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class UserPreferencesDto {
    private Long userId;
    private List<String> favoriteGenres;
    private Boolean reset;

}


package com.playa.mapper;

import com.playa.dto.UserRequestDto;
import com.playa.dto.UserResponseDto;
import com.playa.model.User;
import com.playa.model.enums.Rol;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserMapper {

    public User convertToEntity(UserRequestDto dto) {
        return User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .type(dto.getType())  //!= null ? Rol.valueOf(dto.getType().toUpperCase()) : null)
                .biography(dto.getBiography())
                .redSocial(dto.getRedSocial())
                .favoriteGenres(dto.getFavoriteGenres())
                .idgenre(dto.getIdgenre())
                .build();
    }

    public UserResponseDto convertToResponseDto(User user) {
        return UserResponseDto.builder()
                .idUser(user.getIdUser())
                .name(user.getName())
                .email(user.getEmail())
                .type(user.getType())
                .registerDate(user.getRegisterDate())
                .biography(user.getBiography())
                .premium(user.getPremium())
                .redSocial(user.getRedSocial())
                .favoriteGenres(user.getFavoriteGenres())
                .language(user.getLanguage())
                .historyVisible(user.getHistoryVisible())
                .build();
    }
}
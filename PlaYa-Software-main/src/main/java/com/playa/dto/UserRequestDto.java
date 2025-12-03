package com.playa.dto;

import com.playa.model.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserRequestDto {

    @NonNull
    @Size(max = 100)
    private String name;
    private String email;
    private String password;
    private Rol type;
    private String biography;
    private String redSocial;
    private Boolean premium;
    private Long idgenre;
    private List<String> favoriteGenres;
}

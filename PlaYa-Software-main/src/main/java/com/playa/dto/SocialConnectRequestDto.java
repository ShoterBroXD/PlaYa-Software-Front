package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialConnectRequestDto {

    @NotBlank(message = "La plataforma social es obligatoria")
    @Pattern(regexp = "^(facebook|twitter|instagram|youtube|tiktok)$",
             message = "Plataforma no soportada. Valores permitidos: facebook, twitter, instagram, youtube, tiktok")
    private String platform;

    @NotBlank(message = "Las credenciales son obligatorias")
    private String credentials; // Username, email o token según la plataforma

    private String accessToken; // Token de acceso si es necesario

    private String profileUrl; // URL del perfil a vincular
}

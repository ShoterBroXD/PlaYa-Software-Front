package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialShareRequestDto {

    @NotNull(message = "El ID de la canción es obligatorio")
    private Long songId;

    @NotBlank(message = "La plataforma social es obligatoria")
    @Pattern(regexp = "^(facebook|twitter|instagram|whatsapp|telegram)$",
             message = "Plataforma no soportada. Valores permitidos: facebook, twitter, instagram, whatsapp, telegram")
    private String platform;

    private String message; // Mensaje personalizado opcional

    private String hashtags; // Hashtags opcionales
}

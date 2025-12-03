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
public class SocialProfileRequestDto {

    @Pattern(regexp = "^https?://(?:www\\.)?facebook\\.com/.+",
             message = "URL de Facebook inválida")
    private String facebookUrl;

    @Pattern(regexp = "^https?://(?:www\\.)?twitter\\.com/.+",
             message = "URL de Twitter inválida")
    private String twitterUrl;

    @Pattern(regexp = "^https?://(?:www\\.)?instagram\\.com/.+",
             message = "URL de Instagram inválida")
    private String instagramUrl;

    @Pattern(regexp = "^https?://(?:www\\.)?youtube\\.com/.+",
             message = "URL de YouTube inválida")
    private String youtubeUrl;

    @Pattern(regexp = "^https?://(?:www\\.)?tiktok\\.com/.+",
             message = "URL de TikTok inválida")
    private String tiktokUrl;
}

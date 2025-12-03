package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialShareResponseDto {

    private Long shareId;
    private Long userId;
    private Long songId;
    private String songTitle;
    private String platform;
    private String shareUrl;
    private String message;
    private LocalDateTime sharedAt;
    private Boolean success;
}

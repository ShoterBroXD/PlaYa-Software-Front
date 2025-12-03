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
public class SocialConnectResponseDto {

    private String platform;
    private String status; // "connected", "failed", "pending"
    private String message;
    private String profileUrl;
    private LocalDateTime connectedAt;
    private Boolean isActive;
}

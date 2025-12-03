package com.playa.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FollowResponseDto {
    private UserResponseDto artist;
    private LocalDateTime followedDate;
}

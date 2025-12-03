package com.playa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponse {
    private Long idFollow;
    private Long followerId;
    private String followerName;
    private Long artistId;
    private String artistName;
    private LocalDateTime followDate;
}


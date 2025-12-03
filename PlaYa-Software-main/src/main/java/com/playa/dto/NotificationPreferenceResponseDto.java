package com.playa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponseDto {
    private Boolean enableComments;
    private Boolean enableSystems;
    private Boolean enableNewReleases;
    private Boolean enableFollowers;
}

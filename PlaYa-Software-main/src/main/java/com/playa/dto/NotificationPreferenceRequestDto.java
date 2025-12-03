package com.playa.dto;

import lombok.Data;

@Data
public class NotificationPreferenceRequestDto {
    private Boolean enableComments=true;
    private Boolean enableSystems=true;
    private Boolean enableNewReleases=true;
    private Boolean enableFollowers=true;
}

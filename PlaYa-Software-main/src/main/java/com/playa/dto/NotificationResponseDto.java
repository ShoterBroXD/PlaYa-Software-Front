package com.playa.dto;

import com.playa.model.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private Long idNotification;
    private String content;
    private Boolean read;
    private LocalDateTime date;
    private Category type;
}

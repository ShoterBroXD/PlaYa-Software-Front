package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {

    @NotNull
    private Long idUser;

    @NotBlank
    @Size(max = 100)
    private String content;

    private Boolean read;
    private String type;
    private LocalDateTime date;
}

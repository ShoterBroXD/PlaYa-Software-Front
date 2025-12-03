package com.playa.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class ThreadResponseDto {
    private Long idThread;
    private Long idUser;
    private Long idCommunity;
    private String title;
    private String content;
    private LocalDateTime creationDate;
}

package com.playa.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PostResponseDto {
    private Long idPost;
    private Long idThread;
    private String content;
    private LocalDateTime postDate;
}

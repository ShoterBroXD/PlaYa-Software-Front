package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class PostRequestDto {
    private Long idPost;
    private Long idThread;
    @NotBlank
    @Length(max = 144)
    private String content;
}

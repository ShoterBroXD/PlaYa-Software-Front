package com.playa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class ThreadRequestDto {
    private Long idThread;
    private Long idUser;
    private Long idCommunity;
    @NotBlank
    @Length(max = 200)
    private String title;
    @NotBlank
    private String content;
}

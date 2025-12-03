package com.playa.dto.request;

import com.playa.model.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es inválido")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    String password,

    @NotBlank(message = "El nombre es obligatorio")
    String name,

    @NotNull(message = "El tipo de usuario es obligatorio")
    Rol type
) {}

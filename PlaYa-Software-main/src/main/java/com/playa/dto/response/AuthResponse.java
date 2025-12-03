package com.playa.dto.response;

import com.playa.model.enums.Rol;

public record AuthResponse(
    String token,
    String email,
    String name,
    Rol type
) {}

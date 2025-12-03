package com.playa.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePrivacyRequest {
    private Boolean historyVisible; // true = visible, false = oculto
}


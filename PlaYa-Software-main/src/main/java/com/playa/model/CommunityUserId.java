package com.playa.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityUserId implements Serializable {

    @Column(name = "id_community")
    private Long idCommunity;

    @Column(name = "iduser")
    private Long idUser;
}

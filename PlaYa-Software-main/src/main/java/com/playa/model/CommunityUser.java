package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityUser {

    @EmbeddedId
    private CommunityUserId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_community", insertable = false, updatable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iduser", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false, name = "joindate")
    private LocalDateTime joinDate;
}

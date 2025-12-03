package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_shares")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_share")
    private Long shareId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "iduser", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idsong", nullable = false)
    private Song song;

    @Column(name = "platform", nullable = false, length = 50)
    private String platform; // facebook, twitter, instagram, whatsapp, telegram

    @Column(name = "share_url", columnDefinition = "TEXT")
    private String shareUrl;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "shared_at", nullable = false)
    private LocalDateTime sharedAt;

    @Column(name = "success", nullable = false)
    @Builder.Default
    private Boolean success = true;
}

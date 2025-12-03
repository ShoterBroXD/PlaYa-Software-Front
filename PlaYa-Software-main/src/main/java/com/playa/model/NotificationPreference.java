package com.playa.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="notification_preference")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpreference")
    private Long idpreference;

    @OneToOne
    @JoinColumn(name = "idUser", nullable = false, unique = true)
    private User user;

    @Column(name = "enableComments", nullable = false)
    private Boolean enableComments = true;

    @Column(name = "enableFollowers", nullable = false)
    private Boolean enableFollowers = true;

    @Column(name = "enableSystems", nullable = false)
    private Boolean enableSystems = true;

    @Column(name = "enableNewReleases", nullable = false)
    private Boolean enableNewReleases = true;

    // Flag para saber si están todas desactivadas manualmente
    @Column(name = "allDisabled", nullable = false)
    private Boolean allDisabled = false;

    // Campos para guardar estado anterior antes de desactivar todo
    @Column(name = "prevEnableComments")
    private Boolean prevEnableComments;

    @Column(name = "prevEnableFollowers")
    private Boolean prevEnableFollowers;

    @Column(name = "prevEnableSystems")
    private Boolean prevEnableSystems;

    @Column(name = "prevEnableNewReleases")
    private Boolean prevEnableNewReleases;
}

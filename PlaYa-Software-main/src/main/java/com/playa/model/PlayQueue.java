package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "play_queue")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_queue")
    private Long idQueue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iduser", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idsong", nullable = false)
    private Song song;

    @Column(name = "position", nullable = false)
    private Integer position; // Posición en la cola

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    @Column(name = "original_position")
    private Integer originalPosition;

    @PrePersist
    protected void onCreate() {
        if (addedAt == null) {
            addedAt = LocalDateTime.now();
        }
    }
}
package com.playa.model;

import com.playa.model.enums.Mode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Entity
@Table(name = "player_state")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_player_state")
    private Long idPlayerState;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iduser", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idsong")
    private Song currentSong;

    @Column(name = "is_playing", nullable = false)
    private Boolean isPlaying = false;

    @Column(name = "is_paused", nullable = false)
    private Boolean isPaused = false;

    @Column(name = "playback_time")
    private Integer playbackTime = 0;

    @Column(name = "volume")
    private Integer volume = 80; // Volumen (0-100)

    @Column(name = "shuffle_enabled", nullable = false)
    private Boolean shuffleEnabled = false;

    @Enumerated(EnumType.STRING)
    private Mode repeatMode = Mode.NONE;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}

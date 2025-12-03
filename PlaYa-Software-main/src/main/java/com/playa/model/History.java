package com.playa.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "songs_history")
@Builder
@Data
public class History {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUser")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idSong")
    private Song song;

    @Column(nullable = false, name = "dateplayed")
    private LocalDateTime datePlayed;


}


package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcomment")
    private Long idComment;

    @Column(nullable = false, name = "iduser")
    private Long idUser;

    @ManyToOne()
    @JoinColumn(name = "idsong")
    private Song song;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "parentcomment")
    private Long parentComment;

    @Column(name = "visible", nullable = false)
    private Boolean visible = true; // true = visible, false = oculto por reporte

    @Column(nullable = false)
    private LocalDateTime date;

}

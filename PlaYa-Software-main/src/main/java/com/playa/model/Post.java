package com.playa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpost")
    private Long idPost;

    @Column(nullable = false, name = "idthread")
    private Long idThread;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "visible", nullable = false)
    private Boolean visible = true; // true = visible, false = oculto por reporte

    @Column(name = "postdate")
    private LocalDateTime postDate;

    // Constructores
    public Post() {}
}

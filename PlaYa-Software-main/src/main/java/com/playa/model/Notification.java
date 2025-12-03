package com.playa.model;

import com.playa.model.enums.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idnotification")
    private Long idNotification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUser", updatable = false)
    private User user;

    @Column(name = "content",nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "read" ,nullable = false)
    private Boolean read = false;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private Category type;
}

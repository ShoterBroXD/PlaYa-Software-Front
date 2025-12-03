package com.playa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Like {

    @EmbeddedId
    private LikeId id;

    @Column(nullable = false)
    private LocalDateTime date;

}

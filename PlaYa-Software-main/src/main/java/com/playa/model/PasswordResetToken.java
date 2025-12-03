package com.playa.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtoken")
    private Long idtoken;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expirationDate;

    public boolean isExpired() {
        return expirationDate.isBefore(LocalDateTime.now());
    }
}

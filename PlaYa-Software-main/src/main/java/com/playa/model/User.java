package com.playa.model;

import com.playa.model.enums.Rol;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iduser")
    private Long idUser;

    @Column(name = "name", columnDefinition = "VARCHAR(100)")
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String password;

    @Enumerated(EnumType.STRING)
    private Rol type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(nullable = false, name = "registerdate")
    private LocalDateTime registerDate;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(nullable = false)
    private Boolean premium;

    @Column(name = "redsocial", columnDefinition = "TEXT")
    private String redSocial;

    private Boolean active = true;

    @Column(name="idgenre")
    private Long idgenre;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_favorite_genres", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "genre")
    private java.util.List<String> favoriteGenres;

    @Column(name = "language", length = 20)
    private String language = "Español";

    @Column(name = "history_visible")
    private Boolean historyVisible = true;

    public User(String name, String email, String password, Rol type) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.type = type;
        this.premium = false;
        this.registerDate = LocalDateTime.now();
    }

}
package com.playa.repository;

import com.playa.model.PlayerState;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PlayerStateRepository extends JpaRepository<PlayerState, Long> {

    // Obtener el estado del reproductor de un usuario específico
    Optional<PlayerState> findByUser(User user);

    // Verificar si existe estado para un usuario
    boolean existsByUser(User user);
}
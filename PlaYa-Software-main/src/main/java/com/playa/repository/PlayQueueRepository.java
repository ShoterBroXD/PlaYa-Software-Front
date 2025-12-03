package com.playa.repository;

import com.playa.model.PlayQueue;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlayQueueRepository extends JpaRepository<PlayQueue, Long> {


    List<PlayQueue> findByUserOrderByPositionAsc(User user);

    // Eliminar toda la cola de un usuario
    @Modifying
    @Query("DELETE FROM PlayQueue pq WHERE pq.user = :user")
    void deleteAllByUser(@Param("user") User user);

    // Eliminar una canción específica de la cola
    @Modifying
    @Query("DELETE FROM PlayQueue pq WHERE pq.user = :user AND pq.position = :position")
    void deleteByUserAndPosition(@Param("user") User user, @Param("position") Integer position);

    // Contar canciones en la cola
    Long countByUser(User user);

    // Obtener la siguiente canción en la cola
    @Query("SELECT pq FROM PlayQueue pq WHERE pq.user = :user AND pq.position > :currentPosition ORDER BY pq.position ASC")
    List<PlayQueue> findNextInQueue(@Param("user") User user, @Param("currentPosition") Integer currentPosition);

    // Obtener la canción anterior en la cola
    @Query("SELECT pq FROM PlayQueue pq WHERE pq.user = :user AND pq.position < :currentPosition ORDER BY pq.position DESC")
    List<PlayQueue> findPreviousInQueue(@Param("user") User user, @Param("currentPosition") Integer currentPosition);
}
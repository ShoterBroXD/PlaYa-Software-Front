package com.playa.repository;

import com.playa.model.Notification;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user.idUser = :idUser ORDER BY n.date DESC")
    List<Notification> findByUserOrderByDateDesc(@Param("idUser") Long idUser);

    @Query("SELECT n FROM Notification n WHERE n.user.idUser = :idUser AND n.read = false ORDER BY n.date DESC")
    List<Notification> findByUserIdUserAndReadFalseOrderByDateDesc(@Param("idUser") Long idUser);

    // Método para contar notificaciones no leídas
    long countByUserIdUserAndRead(Long idUser, Boolean read);

    List<Notification> findByUserAndReadFalseOrderByDateDesc(User user);
}

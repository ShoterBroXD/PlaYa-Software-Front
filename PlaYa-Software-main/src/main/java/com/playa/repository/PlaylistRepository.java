package com.playa.repository;

import com.playa.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByIdUser(Long idUser);

    @Query("SELECT p FROM Playlist p WHERE p.idUser = :idUser ORDER BY p.creationDate DESC")
    List<Playlist> findByIdUserOrderByCreationDateDesc(@Param("idUser") Long idUser);
}

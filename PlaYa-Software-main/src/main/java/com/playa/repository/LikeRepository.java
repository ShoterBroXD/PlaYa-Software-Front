package com.playa.repository;

import com.playa.model.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.playa.model.Like;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {

    boolean existsById(LikeId id);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.id.song.idSong = :songId")
    long countBySongId(@Param("songId") Long songId);

    @Query("SELECT l FROM Like l WHERE l.id.user.idUser = :userId")
    List<Like> findByUserId(@Param("userId") Long userId);
}

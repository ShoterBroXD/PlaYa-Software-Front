package com.playa.repository;

import com.playa.model.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.playa.model.History;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {


    @Modifying
    @Transactional
    @Query(value = "INSERT INTO songs_history (iduser, idsong, dateplayed) VALUES (:idUser, :idSong, CURRENT_TIMESTAMP)", nativeQuery = true)
    void registerHistory(@Param("idUser") Long idUser, @Param("idSong") Long idSong);
}

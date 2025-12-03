package com.playa.repository;

import com.playa.dto.response.SongPlayReportResponse;
import com.playa.model.SongHistory;
import com.playa.model.SongHistoryId;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongHistoryRepository extends JpaRepository<SongHistory, SongHistoryId> {

    //metodo de consulta para obtener el historial de canciones de un usuario ordenado por fecha de reproduccion descendente
    List<SongHistory> findByUserOrderByDatePlayedDesc(User user);

    @Query("SELECT new com.playa.dto.response.SongPlayReportResponse(sh.song.idSong, sh.song.title, COUNT(sh)) " +
            "FROM SongHistory sh WHERE sh.song.user.idUser = :artistId " +
            "GROUP BY sh.song.idSong, sh.song.title ORDER BY COUNT(sh) DESC")
    List<SongPlayReportResponse> findSongPlayStatsByArtist(Long artistId);

    @Query("SELECT sh.song.title, COUNT(sh) " +
            "FROM SongHistory sh GROUP BY sh.song.title ORDER BY COUNT(sh) DESC")
    List<Object[]> getTopSongsGlobal();
}

package com.playa.repository;

import com.playa.model.SongHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayHistoryRepository extends JpaRepository<SongHistory, Long> {
    @Query("SELECT sh.song.idSong, COUNT(sh) " +
            "FROM SongHistory sh " +
            "WHERE sh.song.user.idUser = :artistId " +
            "GROUP BY sh.song.idSong " +
            "ORDER BY COUNT(sh) DESC")
    List<Object[]> getPlayCountByArtist(@Param("artistId") Long artistId);

    @Query("SELECT sh.song.title, COUNT(sh) " +
            "FROM SongHistory sh " +
            "GROUP BY sh.song.title " +
            "ORDER BY COUNT(sh) DESC")
    List<Object[]> getTopSongsGlobal();

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.artist.idUser = :artistId")
    Long getFollowerCount(@Param("artistId") Long artistId);
}

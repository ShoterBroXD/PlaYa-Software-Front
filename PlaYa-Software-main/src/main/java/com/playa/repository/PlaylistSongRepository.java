package com.playa.repository;

import com.playa.model.PlaylistSong;
import com.playa.model.PlaylistSongId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, PlaylistSongId> {

    List<PlaylistSong> findByIdIdPlaylist(Long idPlaylist);

    @Query("SELECT ps FROM PlaylistSong ps WHERE ps.id.idPlaylist = :idPlaylist ORDER BY ps.date ASC")
    List<PlaylistSong> findByPlaylistIdOrderByDateAsc(@Param("idPlaylist") Long idPlaylist);

    void deleteByIdIdPlaylistAndIdIdSong(Long idPlaylist, Long idSong);

    boolean existsByIdIdPlaylistAndIdIdSong(Long idPlaylist, Long idSong);
}

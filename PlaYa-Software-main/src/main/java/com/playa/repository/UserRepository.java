package com.playa.repository;

import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByIdgenre(Long idgenre);

    @Query("SELECT u FROM User u WHERE u.type = 'ARTIST' AND u.registerDate >= :threshold")
    List<User> findNewArtists(@Param("threshold") LocalDateTime threshold);

    // Artistas emergentes: nuevos o con pocos seguidores
    @Query("SELECT u FROM User u LEFT JOIN Follow f ON u.idUser = f.artist.idUser " +
           "WHERE u.type = 'ARTIST' " +
           "GROUP BY u.idUser " +
           "HAVING COUNT(f.idFollow) <= :maxFollowers OR u.registerDate >= :recentThreshold " +
           "ORDER BY FUNCTION('RANDOM')")
    List<User> findEmergingArtists(@Param("maxFollowers") long maxFollowers,
                                    @Param("recentThreshold") LocalDateTime recentThreshold);

    @Query("SELECT DISTINCT u FROM User u JOIN Song s ON u.idUser = s.user.idUser " +
           "WHERE u.type = 'ARTIST' AND s.uploadDate >= :threshold " +
           "ORDER BY s.uploadDate DESC")
    List<User> findActiveArtists(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT u FROM User u " +
           "WHERE u.type = 'ARTIST' " +
           "AND NOT EXISTS (SELECT sh FROM SongHistory sh WHERE sh.song.user.idUser = u.idUser) " +
           "ORDER BY u.registerDate DESC")
    List<User> findArtistsWithoutPlays();

    // Artistas por diversidad de género (aleatorio, excluyendo géneros del usuario)
    @Query("SELECT u FROM User u " +
           "WHERE u.type = 'ARTIST' " +
           "AND (u.idgenre NOT IN :userGenres OR :userGenres IS NULL) " +
           "ORDER BY FUNCTION('RANDOM')")
    List<User> findArtistsByGenreDiversity(@Param("userGenres") List<Long> userGenres);

}

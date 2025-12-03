package com.playa.repository;


import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.playa.model.Song;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    Long countByUserAndVisibility(User user, String visibility);

    List<Song> findByGenre_IdGenreAndVisibility(Long idGenre, String visibility);

    // Métodos personalizados para encontrar canciones por usuario
    List<Song> findByUser_IdUser(Long idUser);

    // Buscar canciones por idUser y visibilidad (usa la ruta user.idUser)
    List<Song> findByUser_IdUserAndVisibility(Long idUser, String visibility);

    // Método para encontrar canciones por visibilidad
    List<Song> findByVisibility(String visibility);

    Long countByUserAndVisibilityNot(User user, String visibility);

    List<Song> findByUser(User user);

    // Método para encontrar canciones públicas de un usuario
    //List<Song> findByIdUserAndVisibility(Long idUser, String visibility);

    @Query("SELECT s FROM Song s WHERE s.user.idUser = :idUser ORDER BY s.uploadDate DESC")
    List<Song> findByIdUserOrderByUploadDateDesc(@Param("idUser") Long idUser);

    @Query("SELECT s FROM Song s WHERE s.visibility = 'public' ORDER BY s.uploadDate DESC")
    List<Song> findPublicSongsOrderByUploadDateDesc();

    @Query("SELECT s FROM Song s WHERE s.title LIKE %:title% AND s.visibility = 'public'")
    List<Song> findByTitleContainingAndVisibilityPublic(@Param("title") String title);

    Object countByUserIdUser(Long userIdUser);
}

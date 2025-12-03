package com.playa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.playa.model.Post;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Métodos personalizados

    // Buscar posts por hilo (thread)
    List<Post> findByIdThread(Long idThread);

    // Buscar posts por hilo ordenados por fecha
    List<Post> findByIdThreadOrderByPostDateAsc(Long idThread);
    List<Post> findByIdThreadOrderByPostDateDesc(Long idThread);
}

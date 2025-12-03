package com.playa.repository;

import com.playa.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {

    // Métodos personalizados para encontrar comunidades por nombre
    List<Community> findByNameContainingIgnoreCase(String name);

    // Método para encontrar comunidades ordenadas por fecha de creación
    @Query("SELECT c FROM Community c ORDER BY c.creationDate DESC")
    List<Community> findAllOrderByCreationDateDesc();

    // Método para encontrar comunidades por nombre, ordenadas por fecha de creación
    @Query("SELECT c FROM Community c WHERE c.name LIKE %:name% ORDER BY c.creationDate DESC")
    List<Community> findByNameContainingOrderByCreationDateDesc(@Param("name") String name);
}

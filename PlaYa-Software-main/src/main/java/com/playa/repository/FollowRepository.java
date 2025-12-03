package com.playa.repository;

import com.playa.model.Follow;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndArtist(User follower, User Artist);
    void deleteByFollowerAndArtist(User follower, User Artist);

    List<Follow> findByFollower(User follower);
    List<Follow> findByArtist(User Artist);

    long countByFollower(User follower);
    long countByArtist(User Artist);
}
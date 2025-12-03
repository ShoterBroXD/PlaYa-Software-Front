package com.playa.repository;

import com.playa.model.SocialShare;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SocialShareRepository extends JpaRepository<SocialShare, Long> {

    List<SocialShare> findByUserOrderBySharedAtDesc(User user);

    List<SocialShare> findBySong_IdSongOrderBySharedAtDesc(Long songId);

    List<SocialShare> findByPlatformOrderBySharedAtDesc(String platform);

    @Query("SELECT COUNT(s) FROM SocialShare s WHERE s.user = :user AND s.sharedAt >= :since")
    Long countUserSharesSince(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM SocialShare s WHERE s.song.idSong = :songId")
    Long countSharesBySong(@Param("songId") Long songId);
}

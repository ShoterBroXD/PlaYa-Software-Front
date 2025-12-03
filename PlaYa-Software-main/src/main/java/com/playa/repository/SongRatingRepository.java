package com.playa.repository;

import com.playa.model.Song;
import com.playa.model.SongRating;
import com.playa.model.SongRatingId;
import com.playa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SongRatingRepository extends JpaRepository<SongRating, SongRatingId> {
    Optional<SongRating> findById(SongRatingId id);
    List<SongRating> findBySong(Song song);
    Optional<SongRating> findBySongAndUser(Song song, User user);
}


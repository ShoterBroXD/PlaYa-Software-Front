package com.playa.service;

import com.playa.dto.NotificationRequestDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Follow;
import com.playa.model.User;
import com.playa.repository.FollowRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public String followArtist(Long follower_id, Long artist_id){
        User follower = userRepository.findById(follower_id)
                .orElseThrow(() -> new ResourceNotFoundException("Seguidor no encontrado"));
        User artist = userRepository.findById(artist_id)
                .orElseThrow(() -> new com.playa.exception.ResourceNotFoundException("Artista no encontrado"));

        if (followRepository.existsByFollowerAndArtist(follower,artist)){
            return "Ya sigues a este artista";
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setArtist(artist);
        follow.setFollowDate(LocalDateTime.now());
        followRepository.save(follow);

        NotificationRequestDto notification = new NotificationRequestDto();
        notification.setIdUser(artist.getIdUser());
        notification.setContent(follower.getName() + " ha comenzado a seguirte.");
        notification.setType("FOLLOWER");
        notification.setRead(false);

        notificationService.createNotification(notification);

        return "Has comenzado a seguir a "+artist.getName();
    }

    @Transactional
    public String unfollowArtist(Long follower_id, Long artist_id){
        User follower = userRepository.findById(follower_id)
                .orElseThrow(() -> new com.playa.exception.ResourceNotFoundException("Seguidor no encontrado"));
        User artist = userRepository.findById(artist_id)
                .orElseThrow(() -> new com.playa.exception.ResourceNotFoundException("Artista no encontrado"));
        if (!followRepository.existsByFollowerAndArtist(follower,artist)){
            return "No eres seguidor de este artista";
        }
        followRepository.deleteByFollowerAndArtist(follower,artist);
        return "Has dejado de seguir a "+artist.getName();
    }

    @Transactional(readOnly = true)
    public List<Follow> getFollowedArtists(Long followerId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return followRepository.findByFollower(follower);
    }

    @Transactional(readOnly = true)
    public List<Follow> getFollowers(Long artist_id){
        User user = userRepository.findById(artist_id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado"));
        return followRepository.findByArtist(user);
    }

    @Transactional(readOnly = true)
    public long countFollowers(Long artist_id){
        User user = userRepository.findById(artist_id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado"));
        return followRepository.countByArtist(user);
    }

    @Transactional(readOnly = true)
    public long countFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return followRepository.countByFollower(user);
    }
}

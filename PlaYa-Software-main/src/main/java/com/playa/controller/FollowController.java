package com.playa.controller;

import com.playa.dto.response.FollowResponse;
import com.playa.mapper.FollowMapper;
import com.playa.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final FollowMapper followMapper;

    @PostMapping("/{followerId}/follow/{artistId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<String> follow(@PathVariable Long followerId, @PathVariable Long artistId) {
        return ResponseEntity.ok(followService.followArtist(followerId, artistId));
    }

    @DeleteMapping("/{followerId}/unfollow/{artistId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<String> unfollow(@PathVariable Long followerId, @PathVariable Long artistId) {
        return ResponseEntity.ok(followService.unfollowArtist(followerId, artistId));
    }

    @GetMapping("/{userId}/following")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<List<FollowResponse>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followMapper.convertToResponseList(followService.getFollowedArtists(userId)));
    }

    @GetMapping("/{artistId}/followers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<List<FollowResponse>> getFollowers(@PathVariable Long artistId) {
        return ResponseEntity.ok(followMapper.convertToResponseList(followService.getFollowers(artistId)));
    }

    @GetMapping("/{artistId}/followers/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ARTIST') or hasRole('LISTENER')")
    public ResponseEntity<Long> countFollowers(@PathVariable Long artistId) {
        return ResponseEntity.ok(followService.countFollowers(artistId));
    }

    @GetMapping("/{userId}/following/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LISTENER') or hasRole('ARTIST')")
    public ResponseEntity<Long> countFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.countFollowing(userId));
    }
}

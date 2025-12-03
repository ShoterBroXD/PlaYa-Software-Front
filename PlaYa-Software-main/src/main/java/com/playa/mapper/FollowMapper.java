package com.playa.mapper;

import com.playa.dto.response.FollowResponse;
import com.playa.model.Follow;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FollowMapper {

    public FollowResponse convertToResponse(Follow follow) {
        if (follow == null) {
            return null;
        }
        
        return FollowResponse.builder()
                .idFollow(follow.getIdFollow())
                .followerId(follow.getFollower() != null ? follow.getFollower().getIdUser() : null)
                .followerName(follow.getFollower() != null ? follow.getFollower().getName() : null)
                .artistId(follow.getArtist() != null ? follow.getArtist().getIdUser() : null)
                .artistName(follow.getArtist() != null ? follow.getArtist().getName() : null)
                .followDate(follow.getFollowDate())
                .build();
    }

    public List<FollowResponse> convertToResponseList(List<Follow> follows) {
        if (follows == null) {
            return null;
        }
        
        return follows.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}


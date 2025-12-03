package com.playa.mapper;

import com.playa.dto.CommunityRequestDto;
import com.playa.dto.CommunityResponseDto;
import com.playa.model.Community;
import org.springframework.stereotype.Component;

@Component
public class CommunityMapper {

    public Community convertToEntity(CommunityRequestDto requestDto) {
        return Community.builder()
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .build();
    }

    public CommunityResponseDto convertToResponseDto(Community community) {
        return CommunityResponseDto.builder()
                .idCommunity(community.getIdCommunity())
                .name(community.getName())
                .description(community.getDescription())
                .creationDate(community.getCreationDate())
                .build();
    }
}

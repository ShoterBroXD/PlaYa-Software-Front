package com.playa.mapper;

import com.playa.dto.PlaylistRequestDto;
import com.playa.dto.PlaylistResponseDto;
import com.playa.model.Playlist;
import org.springframework.stereotype.Component;

@Component
public class PlaylistMapper {

    public Playlist convertToEntity(PlaylistRequestDto requestDto) {
        return Playlist.builder()
                .idUser(requestDto.getIdUser())
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .build();
    }

    public PlaylistResponseDto convertToResponseDto(Playlist playlist) {
        return PlaylistResponseDto.builder()
                .idPlaylist(playlist.getIdPlaylist())
                .idUser(playlist.getIdUser())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .creationDate(playlist.getCreationDate())
                .build();
    }
}

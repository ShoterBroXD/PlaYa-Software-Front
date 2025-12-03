package com.playa.mapper;

import com.playa.dto.CommentResponseDto;
import com.playa.dto.CommentRequestDto;
import com.playa.model.Comment;
import com.playa.model.Song;
import com.playa.repository.SongRepository;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    private SongRepository songRepository;

    public Comment convertToEntity(Long idUser, CommentRequestDto requestDto) {
        Song song=songRepository.findById(requestDto.getIdSong()).orElseThrow(()-> new RuntimeException("Cancion no encontrada"));
        return Comment.builder()
                .idUser(idUser)
                .song(song)
                .content(requestDto.getContent())
                .parentComment(requestDto.getParentComment())
                .build();
    }

    public CommentResponseDto convertToResponseDto(Comment c) {
        return CommentResponseDto.builder()
                .idComment(c.getIdComment())
                .idUser(c.getIdUser())
                .idSong(c.getSong().getIdSong())
                .content(c.getContent())
                .parentComment(c.getParentComment())
                .date(c.getDate())
                .build();
    }
}

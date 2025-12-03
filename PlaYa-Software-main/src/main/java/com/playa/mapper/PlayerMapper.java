package com.playa.mapper;

import com.playa.dto.ArtistResponseDto;
import com.playa.dto.CurrentPlaybackResponseDto;
import com.playa.dto.QueueSongResponseDto;
import com.playa.model.PlayQueue;
import com.playa.model.PlayerState;
import com.playa.model.Song;
import com.playa.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlayerMapper {

    private final SongMapper songMapper;

    public CurrentPlaybackResponseDto convertToCurrentPlaybackResponseDto(PlayerState state) {
        if (state == null || state.getCurrentSong() == null) {
            return null;
        }

        Song song = state.getCurrentSong();

        CurrentPlaybackResponseDto response = new CurrentPlaybackResponseDto();
        response.setIdSong(song.getIdSong());
        response.setTitle(song.getTitle());
        response.setArtist(mapUserToArtistResponseDto(song.getUser()));
        response.setCoverURL(song.getCoverURL());
        response.setFileURL(song.getFileURL());
        response.setIsPlaying(state.getIsPlaying());
        response.setIsPaused(state.getIsPaused());
        response.setCurrentTime(state.getPlaybackTime());
        response.setDuration(null);
        response.setVolume(state.getVolume());
        response.setShuffleEnabled(state.getShuffleEnabled());
        response.setRepeatMode(state.getRepeatMode());

        return response;
    }

    public QueueSongResponseDto convertToQueueSongResponseDto(PlayQueue queue) {
        if (queue == null || queue.getSong() == null) {
            return null;
        }

        Song song = queue.getSong();

        QueueSongResponseDto response = new QueueSongResponseDto();
        response.setPosition(queue.getPosition());
        response.setIdSong(song.getIdSong());
        response.setTitle(song.getTitle());
        response.setArtist(mapUserToArtistResponseDto(song.getUser()));
        response.setCoverURL(song.getCoverURL());
        response.setDuration(null); // Agregar si tienes en BD

        return response;
    }

    private ArtistResponseDto mapUserToArtistResponseDto(User user) {
        if (user == null) {
            return null;
        }

        ArtistResponseDto response = new ArtistResponseDto();
        response.setIdUser(user.getIdUser());
        response.setName(user.getName());
        response.setBiography(user.getBiography());

        return response;
    }
}


package com.playa.mapper;

import com.playa.dto.ArtistResponseDto;
import com.playa.dto.SongBasicResponseDto;
import com.playa.dto.SongResponseDto;
import com.playa.model.Song;
import com.playa.model.User;
import org.springframework.stereotype.Component;

@Component
public class SongMapper {

    public SongResponseDto convertToResponseDto(Song song) {
        if (song == null) {
            return null;
        }

        SongResponseDto response = new SongResponseDto();
        response.setIdSong(song.getIdSong());
        response.setTitle(song.getTitle());
        response.setDescription(song.getDescription());
        response.setCoverURL(song.getCoverURL());
        response.setFileURL(song.getFileURL());
        response.setVisibility(song.getVisibility());
        response.setUploadDate(song.getUploadDate());

        // Mapear artista
        if (song.getUser() != null) {
            response.setArtist(mapUserToArtistResponseDto(song.getUser()));
        }

        // Mapear género
        response.setGenre(song.getGenre());

        return response;
    }

    public SongBasicResponseDto convertToBasicResponseDto(Song song) {
        if (song == null) {
            return null;
        }

        SongBasicResponseDto response = new SongBasicResponseDto();
        response.setIdSong(song.getIdSong());
        response.setTitle(song.getTitle());
        
        if (song.getUser() != null) {
            response.setArtistName(song.getUser().getName());
        }
        
        response.setCoverURL(song.getCoverURL());
        response.setDuration(song.getDuration());
        
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

    public ArtistResponseDto convertUserToArtistResponseDto(User user) {
        return mapUserToArtistResponseDto(user);
    }
}


package com.playa.service;

import com.playa.dto.AddSongToPlaylistDto;
import com.playa.dto.PlaylistRequestDto;
import com.playa.dto.PlaylistResponseDto;
import com.playa.dto.SongResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.PlaylistMapper;
import com.playa.model.Playlist;
import com.playa.model.PlaylistSong;
import com.playa.model.PlaylistSongId;
import com.playa.model.Song;
import com.playa.repository.PlaylistRepository;
import com.playa.repository.PlaylistSongRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final PlaylistMapper playlistMapper;

    @Transactional
    public PlaylistResponseDto createPlaylist(PlaylistRequestDto requestDto) {
        if (!userRepository.existsById(requestDto.getIdUser())) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + requestDto.getIdUser());
        }
        Playlist playlist = Playlist.builder()
                .idUser(requestDto.getIdUser())
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .creationDate(LocalDateTime.now())
                .build();
        Playlist savedPlaylist = playlistRepository.save(playlist);
        return playlistMapper.convertToResponseDto(savedPlaylist);
    }

    @Transactional(readOnly = true)
    public PlaylistResponseDto getPlaylistById(Long id) {
        Playlist playlist = playlistRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Playlist no encontrada con ID: " + id));
        List<PlaylistSong> playlistSongs = playlistSongRepository.findByPlaylistIdOrderByDateAsc(id);
        List<SongResponseDto> songs = playlistSongs.stream()
                .map(ps -> {
                    Song song = songRepository.findById(ps.getId().getIdSong())
                        .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));
                    return convertSongToResponseDto(song);
                })
                .collect(Collectors.toList());
        PlaylistResponseDto responseDto = playlistMapper.convertToResponseDto(playlist);
        responseDto.setSongs(songs);
        return responseDto;
    }

    @Transactional
    public void addSongToPlaylist(Long playlistId, AddSongToPlaylistDto requestDto) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist no encontrada con ID: " + playlistId);
        }
        if (!songRepository.existsById(requestDto.getIdSong())) {
            throw new ResourceNotFoundException("Canción no encontrada con ID: " + requestDto.getIdSong());
        }
        if (playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, requestDto.getIdSong())) {
            throw new IllegalArgumentException("La canción ya está en la playlist");
        }
        PlaylistSongId playlistSongId = PlaylistSongId.builder()
                .idPlaylist(playlistId)
                .idSong(requestDto.getIdSong())
                .build();
        PlaylistSong playlistSong = PlaylistSong.builder()
                .id(playlistSongId)
                .date(LocalDateTime.now())
                .build();
        playlistSongRepository.save(playlistSong);
    }

    @Transactional
    public void addSongsToPlaylist(Long playlistId, com.playa.dto.AddSongsToPlaylistDto requestDto) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist no encontrada con ID: " + playlistId);
        }

        List<Long> songIds = requestDto.getSongIds();
        LocalDateTime now = LocalDateTime.now();

        for (Long songId : songIds) {
            if (!songRepository.existsById(songId)) {
                // Opcional: Lanzar error o ignorar. Aquí ignoramos si no existe para seguir con los demás
                continue; 
            }
            // Verificar si ya existe en la playlist para evitar duplicados
            if (playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, songId)) {
                continue;
            }

            PlaylistSongId playlistSongId = PlaylistSongId.builder()
                    .idPlaylist(playlistId)
                    .idSong(songId)
                    .build();
            PlaylistSong playlistSong = PlaylistSong.builder()
                    .id(playlistSongId)
                    .date(now)
                    .build();
            playlistSongRepository.save(playlistSong);
        }
    }

    @Transactional
    public void removeSongFromPlaylist(Long playlistId, Long songId) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist no encontrada con ID: " + playlistId);
        }
        if (!playlistSongRepository.existsByIdIdPlaylistAndIdIdSong(playlistId, songId)) {
            throw new ResourceNotFoundException("La canción no está en la playlist");
        }
        playlistSongRepository.deleteByIdIdPlaylistAndIdIdSong(playlistId, songId);
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponseDto> getAllPlaylists() {
        List<Playlist> playlists = playlistRepository.findAll();
        return playlists.stream()
                .filter(playlist -> playlist.getVisible()) // Filtrar solo playlists visibles
                .map(playlistMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponseDto> getPlaylistsByUser(Long userId) {
        List<Playlist> playlists = playlistRepository.findByIdUserOrderByCreationDateDesc(userId);
        return playlists.stream()
                .filter(playlist -> playlist.getVisible()) // Filtrar solo playlists visibles
                .map(playlistMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Playlist no encontrada con ID: " + id);
        }
        List<PlaylistSong> playlistSongs = playlistSongRepository.findByIdIdPlaylist(id);
        playlistSongRepository.deleteAll(playlistSongs);
        playlistRepository.deleteById(id);
    }

    @Transactional
    public void reportPlaylist(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist no encontrada con ID: " + id));
        playlist.setVisible(false);
        playlistRepository.save(playlist);
    }

    @Transactional
    public void unreportPlaylist(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist no encontrada con ID: " + id));
        playlist.setVisible(true);
        playlistRepository.save(playlist);
    }

    private SongResponseDto convertSongToResponseDto(Song song) {
        return SongResponseDto.builder()
                .idSong(song.getIdSong())
                .idUser(song.getUser().getIdUser())
                .title(song.getTitle())
                .description(song.getDescription())
                .coverURL(song.getCoverURL())
                .fileURL(song.getFileURL())
                .visibility(song.getVisibility())
                .uploadDate(song.getUploadDate())
                .build();
    }
}

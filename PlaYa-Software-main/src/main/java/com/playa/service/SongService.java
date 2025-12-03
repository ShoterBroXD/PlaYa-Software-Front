package com.playa.service;

import com.playa.dto.ArtistResponseDto;
import com.playa.dto.CommentResponseDto;
import com.playa.mapper.CommentMapper;
import com.playa.model.Comment;
import com.playa.model.Genre;
import com.playa.model.User;
import com.playa.repository.CommentRepository;
import com.playa.repository.GenreRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.playa.repository.SongRepository;
import com.playa.model.Song;
import com.playa.dto.SongRequestDto;
import com.playa.dto.SongResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.exception.SongLimitExceededException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import com.playa.repository.SongRatingRepository;
import com.playa.model.SongRating;
import com.playa.model.SongRatingId;

@Service
@RequiredArgsConstructor
public class SongService {

    private static final Long MAX_FREE_SONGS = 10L;
    private static final Set<String> ALLOWED_FILE_FORMATS = Set.of("mp3", "wav", "flac");

    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final SongRatingRepository songRatingRepository;

    public List<SongResponseDto> getAllSongs() {
        return songRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    private void validateFileFormat(String fileURL) {
        String fileExtension = fileURL.substring(fileURL.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_FILE_FORMATS.contains(fileExtension)) {
            throw new IllegalArgumentException("Formato de archivo no permitido: " + fileExtension);
        }
    }

    public SongResponseDto createSong(Long userId, SongRequestDto songRequestDto) {
        User user=userRepository.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("Usuario no encontrado."));

        if(!user.getPremium()){
            Long activeSongs=songRepository.countByUserAndVisibilityNot(user,"deleted");
            if(activeSongs>=MAX_FREE_SONGS){
                throw new com.playa.exception.SongLimitExceededException(
                        "Los usuarios gratuitos no pueden subir más de " + MAX_FREE_SONGS + " canciones. Actualiza a premium para subir más canciones.",
                        activeSongs,
                        MAX_FREE_SONGS
                );
            }
        }

        if (songRequestDto.getCoverURL() == null || songRequestDto.getCoverURL().isBlank()) {
            throw new IllegalArgumentException("La URL de la portada no puede estar vacía");
        }

        validateFileFormat(songRequestDto.getFileURL());

        Song song=new Song();
        song.setUser(user);
        song.setTitle(songRequestDto.getTitle());
        song.setDescription(songRequestDto.getDescription());
        song.setCoverURL(songRequestDto.getCoverURL());
        song.setFileURL(songRequestDto.getFileURL());
        song.setVisibility(songRequestDto.getVisibility());
        song.setDuration(songRequestDto.getDuration() != null ? songRequestDto.getDuration() : 0.0f);
        song.setUploadDate(LocalDateTime.now());

        Genre genre=songRequestDto.getIdgenre()!=null?
                genreRepository.findById(songRequestDto.getIdgenre())
                        .orElseThrow(()->new ResourceNotFoundException("Género no encontrado.")):null;
        song.setGenre(genre);

        Song savedSong=songRepository.save(song);
        return convertToResponseDto(savedSong);

    }

    @Transactional(readOnly = true)
    public SongResponseDto getSongById(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada con ID: " + id));
        return convertToResponseDto(song);
    }

    @Transactional
    public SongResponseDto updateSong(Long id, SongRequestDto songRequestDto) {
        Song song = songRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Canción no encontrada con id: " + id)
        );

        // Actualizar solo los campos que no son null
        if (songRequestDto.getTitle() != null) {
            song.setTitle(songRequestDto.getTitle());
        }
        if (songRequestDto.getDescription() != null) {
            song.setDescription(songRequestDto.getDescription());
        }
        if (songRequestDto.getVisibility() != null) {
            song.setVisibility(songRequestDto.getVisibility());
        }

        Song updatedSong = songRepository.save(song);
        return convertToResponseDto(updatedSong);
    }

    public void deleteSong(Long id) {
        Song song = songRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Canción no encontrada con id: " + id)
        );
        songRepository.delete(song);
    }

    public List<CommentResponseDto> getAllComments(Long idsong) {
        Song song = songRepository.findById(idsong).orElseThrow(()->new RuntimeException("Canción no encontrada"));

        List<Comment> comments= commentRepository.findBySong_IdSongOrderByDateAsc(idsong);
        return comments.stream()
                .map(commentMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public List<SongResponseDto> getSongsByUser(Long idUser) {
        return songRepository.findByUser_IdUser(idUser).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public List<SongResponseDto> getPublicSongs() {
        return songRepository.findByVisibility("public").stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reportSong(Long id) {
        Song song = songRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Canción no encontrada con id: " + id)
        );
        song.setVisible(false);
        songRepository.save(song);
    }

    @Transactional
    public void unreportSong(Long id) {
        Song song = songRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Canción no encontrada con id: " + id)
        );
        song.setVisible(true);
        songRepository.save(song);
    }

    private SongResponseDto convertToResponseDto(Song song) {
        // Crear ArtistResponseDto desde el User
        ArtistResponseDto artist = null;
        if (song.getUser() != null) {
            artist = new ArtistResponseDto(
                song.getUser().getIdUser(),
                song.getUser().getName(),
                song.getUser().getBiography(),
                null // El genre del artist se maneja por separado
            );
        }

        return SongResponseDto.builder()
                .idSong(song.getIdSong())
                .idUser(song.getUser().getIdUser())
                .title(song.getTitle())
                .description(song.getDescription())
                .coverURL(song.getCoverURL())
                .fileURL(song.getFileURL())
                .visibility(song.getVisibility())
                .duration(song.getDuration())
                .uploadDate(song.getUploadDate())
                .artist(artist)
                .genre(song.getGenre())
                .averageRating(song.getAverageRating())
                .ratingCount(song.getRatingCount())
                .build();
    }

    @Transactional
    public SongResponseDto rateSong(Long songId, Long userId, int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada con id: " + songId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + userId));

        // Buscar calificación existente del usuario
        var existingOpt = songRatingRepository.findBySongAndUser(song, user);

        double total = (song.getAverageRating() != null ? song.getAverageRating() : 0.0) * (song.getRatingCount() != null ? song.getRatingCount() : 0);
        int count = song.getRatingCount() != null ? song.getRatingCount() : 0;

        if (existingOpt.isPresent()) {
            // Actualizar calificación existente
            SongRating existing = existingOpt.get();
            int previous = existing.getRating();
            existing.setRating(rating);
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            songRatingRepository.save(existing);

            total = total - previous + rating;
            // count no cambia
        } else {
            // Nueva calificación
            SongRating ratingEntity = new SongRating();
            ratingEntity.setId(new SongRatingId(songId, userId));
            ratingEntity.setSong(song);
            ratingEntity.setUser(user);
            ratingEntity.setRating(rating);
            ratingEntity.setUpdatedAt(java.time.LocalDateTime.now());
            songRatingRepository.save(ratingEntity);

            count = count + 1;
            total = total + rating;
        }

        song.setRatingCount(count);
        song.setAverageRating(count == 0 ? 0.0 : total / count);
        Song saved = songRepository.save(song);
        return convertToResponseDto(saved);
    }
}

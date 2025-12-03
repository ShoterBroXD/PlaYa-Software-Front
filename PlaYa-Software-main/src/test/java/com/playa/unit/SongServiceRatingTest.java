package com.playa.unit;

import com.playa.dto.SongResponseDto;
import com.playa.model.Song;
import com.playa.model.SongRating;
import com.playa.model.SongRatingId;
import com.playa.model.User;
import com.playa.repository.CommentRepository;
import com.playa.repository.GenreRepository;
import com.playa.repository.SongRatingRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import com.playa.service.SongService;
import com.playa.mapper.CommentMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SongServiceRatingTest {

    @Mock private SongRepository songRepository;
    @Mock private UserRepository userRepository;
    @Mock private GenreRepository genreRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private CommentMapper commentMapper;
    @Mock private SongRatingRepository songRatingRepository;

    @InjectMocks
    private SongService songService;

    private User listener;

    @BeforeEach
    void setUp() {
        listener = User.builder()
                .idUser(10L)
                .email("oyente@example.com")
                .name("Oyente")
                .password("secret")
                .premium(false)
                .registerDate(LocalDateTime.now())
                .build();
        when(userRepository.findById(listener.getIdUser())).thenReturn(Optional.of(listener));

        // Default songRepository.save behavior: return entity passed
        when(songRepository.save(any(Song.class))).thenAnswer(inv -> inv.getArgument(0));
        when(songRatingRepository.save(any(SongRating.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("CP-052 Calificar una canción por primera vez (US-012)")
    void rateSong_firstTime() {
        // Precondición: promedio actual 3.5 con 4 calificaciones (total=14)
        Song song = Song.builder()
                .idSong(100L)
                .user(listener) // propietario irrelevante aquí
                .title("Canción de Prueba")
                .coverURL("cover")
                .fileURL("file.mp3")
                .visibility("public")
                .uploadDate(LocalDateTime.now())
                .averageRating(3.5)
                .ratingCount(4)
                .build();

        when(songRepository.findById(song.getIdSong())).thenReturn(Optional.of(song));
        when(songRatingRepository.findBySongAndUser(song, listener)).thenReturn(Optional.empty());

        // Acción: calificar con 5 estrellas
        SongResponseDto dto = songService.rateSong(song.getIdSong(), listener.getIdUser(), 5);

        // Nuevo total esperado: 14 + 5 = 19; nuevo count = 5; promedio = 19/5 = 3.8
        assertThat(dto.getAverageRating()).isEqualTo(3.8);
        assertThat(dto.getRatingCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("CP-053 Modificar calificación existente (US-012)")
    void rateSong_updateExisting() {
        // Precondición: usuario ya calificó con 5; promedio inicial 5 con 1 calificación (total=5)
        Song song = Song.builder()
                .idSong(200L)
                .user(listener)
                .title("Canción Ejemplo")
                .coverURL("cover")
                .fileURL("file.mp3")
                .visibility("public")
                .uploadDate(LocalDateTime.now())
                .averageRating(5.0)
                .ratingCount(1)
                .build();

        when(songRepository.findById(song.getIdSong())).thenReturn(Optional.of(song));

        SongRating existing = new SongRating(new SongRatingId(song.getIdSong(), listener.getIdUser()), song, listener, 5, LocalDateTime.now());
        when(songRatingRepository.findBySongAndUser(song, listener)).thenReturn(Optional.of(existing));

        // Acción: actualizar a 2 estrellas
        SongResponseDto dto = songService.rateSong(song.getIdSong(), listener.getIdUser(), 2);

        // Nuevo total: (5 * 1 - 5 + 2) = 2; count se mantiene 1; promedio = 2/1 = 2.0
        assertThat(dto.getAverageRating()).isEqualTo(2.0);
        assertThat(dto.getRatingCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("CP-054 Calificar con 1 estrella (US-012)")
    void rateSong_lowRatingAccepted() {
        // Precondición: canción sin calificaciones (avg=0, count=0)
        Song song = Song.builder()
                .idSong(300L)
                .user(listener)
                .title("Canción Ejemplo 2")
                .coverURL("cover")
                .fileURL("file.mp3")
                .visibility("public")
                .uploadDate(LocalDateTime.now())
                .averageRating(0.0)
                .ratingCount(0)
                .build();

        when(songRepository.findById(song.getIdSong())).thenReturn(Optional.of(song));
        when(songRatingRepository.findBySongAndUser(song, listener)).thenReturn(Optional.empty());

        // Acción: calificar con 1 estrella
        SongResponseDto dto = songService.rateSong(song.getIdSong(), listener.getIdUser(), 1);

        assertThat(dto.getAverageRating()).isEqualTo(1.0);
        assertThat(dto.getRatingCount()).isEqualTo(1);
    }
}


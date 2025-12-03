package com.playa.service;

import com.playa.dto.ArtistResponseDto;
import com.playa.dto.SongResponseDto;
import com.playa.model.Like;
import com.playa.model.LikeId;
import com.playa.model.Song;
import com.playa.model.User;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.playa.repository.LikeRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;

    @Transactional
    public void addLike(Long idSong, Long idUser) {
        Song song = songRepository.findById(idSong)
                .orElseThrow(()->new RuntimeException("Canción no encontrada"));
        User user = userRepository.findById(idUser)
                .orElseThrow(()->new RuntimeException("Usuario no encontrado"));

        LikeId likeId = new LikeId(user, song);
        if (likeRepository.existsById(likeId)) {
            return;
        }

        Like like = new Like();
        like.setId(likeId);
        like.setDate(LocalDateTime.now());
        likeRepository.save(like);
    }

    @Transactional
    public void removeLike(Long idSong, Long idUser) {
        Song song = songRepository.findById(idSong)
                .orElseThrow(()->new RuntimeException("Canción no encontrada"));
        User user = userRepository.findById(idUser)
                .orElseThrow(()->new RuntimeException("Usuario no encontrado"));

        LikeId likeId = new LikeId(user, song);
        if (!likeRepository.existsById(likeId)) {
            throw new RuntimeException("Like no encontrado");
        }
        likeRepository.deleteById(likeId);
    }

    @Transactional
    public List<SongResponseDto> getLikedSongsByUser(Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(()->new RuntimeException("Usuario no encontrado"));

        List<Like> likes = likeRepository.findByUserId(idUser);

        return likes.stream()
                .map(like -> {
                    Song song = like.getId().getSong();
                    User artist = song.getUser();

                    ArtistResponseDto artistDto = new ArtistResponseDto(
                            artist.getIdUser(),
                            artist.getName(),
                            artist.getBiography(),
                            null  // No incluimos el género del artista
                    );

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
                            .artist(artistDto)
                            .genre(song.getGenre())
                            .averageRating(song.getAverageRating())
                            .ratingCount(song.getRatingCount())
                            .build();
                })
                .collect(Collectors.toList());
    }
}

package com.playa.service;

import com.playa.dto.GenreRequestDto;
import com.playa.dto.GenreResponseDto;
import com.playa.dto.SongResponseDto;
import com.playa.exception.BusinessRuleException;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Genre;
import com.playa.repository.GenreRepository;
import com.playa.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class GenreService {
    private final GenreRepository genreRepository;
    private final SongRepository songRepository;
    private final SongService songService;

    @Transactional
    public GenreResponseDto createGenre(GenreRequestDto dto) {
        if (genreRepository.findByName(dto.getName()).isPresent()){
            throw new BusinessRuleException("El generon ya existe");
        }

        Genre g= new Genre();
        g.setName(dto.getName());

        Genre saved = genreRepository.save(g);
        return toDto(saved);
    }

    public List<SongResponseDto> getSongsByGenre(Long genreId) {
        if (!genreRepository.existsById(genreId)) {
            throw new ResourceNotFoundException("Género no encontrado");
        }
        return songRepository.findByGenre_IdGenreAndVisibility(genreId, "public").stream()
                .map(song -> songService.getSongById(song.getIdSong()))
                .collect(Collectors.toList());
    }

    public List<GenreResponseDto> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(g -> new GenreResponseDto(g.getIdGenre(), g.getName()))
                .collect(Collectors.toList());
    }

    private GenreResponseDto toDto(Genre genre) {
        return new GenreResponseDto(genre.getIdGenre(), genre.getName());
    }
}

package com.playa.service;

import com.playa.dto.*;
import com.playa.exception.PlayerException;
import com.playa.exception.QueueEmptyException;
import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.PlayerMapper;
import com.playa.mapper.SongMapper;
import com.playa.model.*;
import com.playa.model.enums.Mode;
import com.playa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerStateRepository playerStateRepository;
    private final PlayQueueRepository playQueueRepository;
    private final SongHistoryRepository songHistoryRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final SongService songService;
    private final SongMapper songMapper;
    private final PlayerMapper playerMapper;


    @Transactional
    public void registerPlay(Long userId, Long songId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));

        // Crear registro de historial
        SongHistoryId historyId = new SongHistoryId(songId, userId);
        Optional<SongHistory> existingHistory = songHistoryRepository.findById(historyId);

        SongHistory history = existingHistory.orElseGet(() -> {
            SongHistory h = new SongHistory();
            h.setId(historyId);
            h.setUser(user);
            h.setSong(song);
            return h;
        });

        history.setDatePlayed(java.time.LocalDateTime.now());
        songHistoryRepository.save(history);
    }

    public CurrentPlaybackResponseDto getCurrentPlayback(Long userId) {
        User user = getUserOrThrow(userId);
        PlayerState state = playerStateRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No hay ninguna canción en reproducción"));

        if (state.getCurrentSong() == null) {
            throw new ResourceNotFoundException("No hay ninguna canción en reproducción");
        }

        return playerMapper.convertToCurrentPlaybackResponseDto(state);
    }

    @Transactional
    public PlaybackControlResponseDto playSong(Long userId, PlaySongRequestDto request) {
        User user = getUserOrThrow(userId);
        Song song = songRepository.findById(request.getIdSong())
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));

        if ("private".equals(song.getVisibility()) && !song.getUser().getIdUser().equals(userId)) {
            throw new IllegalArgumentException("Esta canción es privada y no puedes acceder a ella");
        }

        if (request.getIdsqueue() != null && !request.getIdsqueue().isEmpty()) {
            playQueueRepository.deleteAllByUser(user);
            List<PlayQueue> newQueue = new ArrayList<>();

            int position = 1;
            for (Long songId : request.getIdsqueue()) {
                Song queueSong = songRepository.findById(songId)
                        .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada en la cola"));
                PlayQueue queueItem = new PlayQueue();
                queueItem.setUser(user);
                queueItem.setSong(queueSong);
                queueItem.setPosition(position);
                queueItem.setOriginalPosition(position);
                newQueue.add(queueItem);
                position++;
            }
            playQueueRepository.saveAll(newQueue);
        }

        PlayerState state = playerStateRepository.findByUser(user)
                .orElse(new PlayerState());

        if (state.getUser() == null) {
            state.setUser(user);
        }

        state.setCurrentSong(song);
        state.setIsPlaying(true);
        state.setIsPaused(false);
        state.setPlaybackTime(0);

        playerStateRepository.save(state);
        registerPlayHistory(user, song);

        PlaybackControlResponseDto response = new PlaybackControlResponseDto();
        response.setMessage("Reproducción iniciada");
        response.setIsPlaying(true);
        response.setIsPaused(false);
        response.setSong(songMapper.convertToResponseDto(song));

        return response;
    }

    @Transactional
    public List<SongResponseDto> getPlayHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<SongHistory> historyList = songHistoryRepository.findByUserOrderByDatePlayedDesc(user);

        if (historyList.isEmpty()) {
            throw new ResourceNotFoundException("El usuario no tiene historial de reproducción");
        }

        return historyList.stream()
                .map(history -> {
                    Long songId = history.getSong().getIdSong();
                    return songService.getSongById(songId);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public PlaybackControlResponseDto pause(Long userId) {
        PlayerState state = getPlayerStateOrThrow(userId);

        if (!state.getIsPlaying()) {
            throw new PlayerException("No hay reproducción activa para pausar");
        }

        state.setIsPlaying(false);
        state.setIsPaused(true);
        playerStateRepository.save(state);

        return new PlaybackControlResponseDto("Reproducción pausada", false, true, null);
    }

    @Transactional
    public PlaybackControlResponseDto resume(Long userId) {
        PlayerState state = getPlayerStateOrThrow(userId);

        if (!state.getIsPaused()) {
            throw new PlayerException("No hay reproducción pausada para reanudar");
        }

        state.setIsPlaying(true);
        state.setIsPaused(false);
        playerStateRepository.save(state);

        return new PlaybackControlResponseDto("Reproducción reanudada", true, false, null);
    }

    @Transactional
    public PlaybackControlResponseDto stop(Long userId) {
        PlayerState state = getPlayerStateOrThrow(userId);

        state.setCurrentSong(null);
        state.setIsPlaying(false);
        state.setIsPaused(false);
        state.setPlaybackTime(0);
        playerStateRepository.save(state);

        return new PlaybackControlResponseDto("Reproducción detenida", false, false, null);
    }

    @Transactional
    public PlaybackControlResponseDto next(Long userId) {
        User user = getUserOrThrow(userId);
        PlayerState state = getPlayerStateOrThrow(userId);

        if (state.getRepeatMode() == Mode.ONE) {
            state.setPlaybackTime(0);
            playerStateRepository.save(state);

            PlaybackControlResponseDto response = new PlaybackControlResponseDto();
            response.setMessage("Repitiendo canción actual");
            response.setIsPlaying(true);
            response.setIsPaused(false);
            response.setSong(songMapper.convertToResponseDto(state.getCurrentSong()));

            return response;
        }

        // Buscar siguiente en la cola
        List<PlayQueue> queue = playQueueRepository.findByUserOrderByPositionAsc(user);

        if (queue.isEmpty()) {
            throw new QueueEmptyException("No hay siguiente canción en la cola");
        }

        Long currentSongId = state.getCurrentSong() != null ? state.getCurrentSong().getIdSong() : null;

        // Encontrar índice actual
        int currentIndex = -1;
        if (currentSongId != null) {
            for (int i = 0; i < queue.size(); i++) {
                Long idqs=queue.get(i).getSong() != null ? queue.get(i).getSong().getIdSong() : null;
                if (Objects.equals(idqs, currentSongId)) {
                    currentIndex = i;
                    break;
                }
            }
        }

        int nextIndex = currentIndex + 1;
        if (currentIndex == -1){
            nextIndex = 0;
        }

        if (nextIndex >= queue.size()) {
            // Si estamos en repeat all, volver al inicio
            if (state.getRepeatMode() == Mode.ALL) {
                nextIndex = 0;
            } else {
                throw new QueueEmptyException("No hay más canciones en la cola");
            }
        }

        Song nextSong = queue.get(nextIndex).getSong();
        state.setCurrentSong(nextSong);
        state.setPlaybackTime(0);
        playerStateRepository.save(state);
        playerStateRepository.flush();

        registerPlayHistory(user, nextSong);

        PlaybackControlResponseDto response = new PlaybackControlResponseDto();
        response.setMessage("Siguiente canción");
        response.setIsPlaying(true);
        response.setIsPaused(false);
        response.setSong(songMapper.convertToResponseDto(nextSong));

        return response;
    }

    @Transactional
    public PlaybackControlResponseDto previous(Long userId) {
        User user = getUserOrThrow(userId);
        PlayerState state = getPlayerStateOrThrow(userId);

        List<PlayQueue> queue = playQueueRepository.findByUserOrderByPositionAsc(user);

        if (queue.isEmpty()) {
            throw new QueueEmptyException("No hay canción anterior en la cola");
        }

        int currentIndex = -1;
        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getSong().getIdSong().equals(state.getCurrentSong().getIdSong())) {
                currentIndex = i;
                break;
            }
        }

        int previousIndex = currentIndex - 1;
        if (previousIndex < 0) {
            if (state.getRepeatMode() == Mode.ALL) {
                previousIndex = queue.size() - 1;
            } else {
                throw new QueueEmptyException("No hay canción anterior en la cola");
            }
        }

        Song previousSong = queue.get(previousIndex).getSong();
        state.setCurrentSong(previousSong);
        state.setPlaybackTime(0);
        playerStateRepository.save(state);

        registerPlayHistory(user, previousSong);

        PlaybackControlResponseDto response = new PlaybackControlResponseDto();
        response.setMessage("Canción anterior");
        response.setIsPlaying(true);
        response.setIsPaused(false);
        response.setSong(songMapper.convertToResponseDto(previousSong));

        return response;
    }

    @Transactional
    public Map<String, Object> seekTo(Long idUser, SeekRequestDto request) {
        PlayerState state = getPlayerStateOrThrow(idUser);

        state.setPlaybackTime(request.getTime());
        playerStateRepository.save(state);

        Map<String, Object> response = new HashMap<>();
        response.put("message", idUser);
        response.put("currentTime",request.getTime());

        return response;
    }

    @Transactional
    public Map<String, Object> setShuffle(Long userId, ShuffleRequestDto request) {
        User user = getUserOrThrow(userId);
        PlayerState state = getPlayerStateOrThrow(userId);

        state.setShuffleEnabled(request.getEnabled());
        playerStateRepository.save(state);

        List<PlayQueue> queue = playQueueRepository.findByUserOrderByPositionAsc(user);

        if (request.getEnabled()) {

            if (!queue.isEmpty() && state.getCurrentSong() != null) {

                for (PlayQueue q : queue) {
                    q.setOriginalPosition(q.getPosition());
                }

                PlayQueue currentQueue = queue.stream()
                        .filter(q->q.getSong().getIdSong().equals(state.getCurrentSong().getIdSong()))
                        .findFirst()
                        .orElse(null);

                List<PlayQueue> otherSongs = queue.stream()
                        .filter(q->!q.getSong().getIdSong().equals(state.getCurrentSong().getIdSong()))
                        .collect(Collectors.toList());


                Collections.shuffle(otherSongs);

                int position = 1;
                if (currentQueue != null) {
                    currentQueue.setPosition(position++);
                    playQueueRepository.save(currentQueue);
                }

                for (PlayQueue q : otherSongs) {
                    q.setPosition(position++);
                    playQueueRepository.save(q);
                }
            }
        } else {
            for(PlayQueue q : queue){
                q.setPosition(q.getOriginalPosition());
                playQueueRepository.save(q);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", request.getEnabled() ? "Modo aleatorio activado" : "Modo aleatorio desactivado");
        response.put("shuffleEnabled", request.getEnabled());

        return response;
    }

    @Transactional
    public Map<String, Object> setRepeatMode(Long userId, RepeatModeRequestDto request) {
        PlayerState state = getPlayerStateOrThrow(userId);

        Mode mode;

        if(request.getMode() == null)
            mode = Mode.NONE;
        else {
            try {
                mode = Mode.valueOf(request.getMode().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Modo de repetición inválido: " + request.getMode());
            }
        }
        state.setRepeatMode(mode);
        playerStateRepository.save(state);

        String modeDescription = switch (mode) {
            case NONE -> "sin repetición";
            case ONE -> "una canción";
            case ALL -> "toda la cola";
            default -> request.getMode();
        };

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Modo repetir: " + modeDescription);
        response.put("repeatMode", mode.name().toLowerCase());

        return response;
    }

    @Transactional
    public Map<String, Object> setVolume(Long userId, VolumeRequestDto request) {
        PlayerState state = getPlayerStateOrThrow(userId);

        state.setVolume(request.getVolume());
        playerStateRepository.save(state);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Volumen ajustado");
        response.put("volume", request.getVolume());

        return response;
    }

    public QueueResponseDto getQueue(Long userId) {
        User user = getUserOrThrow(userId);
        PlayerState state = playerStateRepository.findByUser(user).orElse(null);

        List<PlayQueue> queue = playQueueRepository.findByUserOrderByPositionAsc(user);

        int currentIndex = -1;
        if (state != null && state.getCurrentSong() != null) {
            for (int i = 0; i < queue.size(); i++) {
                if (queue.get(i).getSong().getIdSong().equals(state.getCurrentSong().getIdSong())) {
                    currentIndex = i;
                    break;
                }
            }
        }

        List<QueueSongResponseDto> songs = queue.stream()
                .map(playerMapper::convertToQueueSongResponseDto)
                .collect(Collectors.toList());

        QueueResponseDto response = new QueueResponseDto();
        response.setCurrentIndex(currentIndex);
        response.setTotalSongs(songs.size());
        response.setSongs(songs);

        return response;
    }

    private PlayQueue addSongToQueueInternal(User user, Long idSong, Integer fixedPosition) {
        Song song = songRepository.findById(idSong)
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));
        Long count = playQueueRepository.countByUser(user);
        Integer nextPosition = (fixedPosition != null) ? fixedPosition : count.intValue() + 1;

        PlayQueue queueItem = new PlayQueue();
        queueItem.setUser(user);
        queueItem.setSong(song);
        queueItem.setPosition(nextPosition);
        queueItem.setOriginalPosition(nextPosition);

        return queueItem;
    }


    @Transactional
    public Map<String, Object> addToQueue(Long userId, AddToQueueRequestDto request) {
        User user = getUserOrThrow(userId);
        Song song = songRepository.findById(request.getIdSong())
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));

        PlayQueue queueItem = addSongToQueueInternal(user, request.getIdSong(),null);
        playQueueRepository.save(queueItem);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Canción agregada a la cola");
        response.put("song", songMapper.convertToBasicResponseDto(song));
        response.put("queuePosition", queueItem.getPosition());

        return response;
    }

    @Transactional
    public void removeFromQueue(Long userId, Integer position) {
        User user = getUserOrThrow(userId);
        playQueueRepository.deleteByUserAndPosition(user, position);

        List<PlayQueue> remainingQueue = playQueueRepository.findByUserOrderByPositionAsc(user);

        int newPosition = 1;
        for (PlayQueue item : remainingQueue) {
            item.setPosition(newPosition++);
            playQueueRepository.save(item);
        }
    }

    public List<HistoryResponseDto> getHistory(Long userId, Integer limit) {
        User user = getUserOrThrow(userId);

        List<SongHistory> history = songHistoryRepository.findByUserOrderByDatePlayedDesc(user);

        return history.stream()
                .limit(limit != null ? limit : 50)
                .map(h -> new HistoryResponseDto(songMapper.convertToResponseDto(h.getSong()), h.getDatePlayed()))
                .collect(Collectors.toList());
    }

    public List<RecommendationResponseDto> getRecommendations(Long userId) {
        User user = getUserOrThrow(userId);

        // Obtener géneros más escuchados del historial
        List<SongHistory> history = songHistoryRepository.findByUserOrderByDatePlayedDesc(user);

        if (history.isEmpty()) {
            throw new ResourceNotFoundException("No hay suficiente historial para generar recomendaciones");
        }

        // Contar géneros más escuchados
        Map<Genre, Long> genreCounts = new HashMap<>();
        for (SongHistory h : history) {
            Genre genre = h.getSong().getGenre();
            if (genre != null) {
                genreCounts.put(genre, genreCounts.getOrDefault(genre, 0L) + 1);
            }
        }

        // Ordenar por más escuchados
        List<Genre> topGenres = genreCounts.entrySet().stream()
                .sorted(Map.Entry.<Genre, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Buscar canciones de esos géneros que NO estén en el historial
        Set<Long> playedSongIds = history.stream()
                .map(h -> h.getSong().getIdSong())
                .collect(Collectors.toSet());

        List<RecommendationResponseDto> recommendations = new ArrayList<>();

        for (Genre genre : topGenres) {
            List<Song> songs = songRepository.findByGenre_IdGenreAndVisibility(genre.getIdGenre(), "public");
            songs.stream()
                    .filter(s -> !playedSongIds.contains(s.getIdSong()))
                    .limit(5)
                    .forEach(song -> {
                        RecommendationResponseDto rec = new RecommendationResponseDto();
                        rec.setIdSong(song.getIdSong());
                        rec.setTitle(song.getTitle());
                        rec.setArtist(songMapper.convertUserToArtistResponseDto(song.getUser()));
                        rec.setCoverURL(song.getCoverURL());
                        Set<GenreResponseDto> genres = new HashSet<>();
                        Genre g = song.getGenre();
                        if (g != null) {
                            genres.add(new GenreResponseDto(g.getIdGenre(), g.getName()));
                        }
                        rec.setGenres(genres);
                        rec.setReason("Basado en tu historial de " + genre.getName());
                        recommendations.add(rec);
                    });
        }

        return recommendations.stream().limit(10).collect(Collectors.toList());
    }


    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private PlayerState getPlayerStateOrThrow(Long userId) {
        User user = getUserOrThrow(userId);
        return playerStateRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No hay estado de reproductor activo"));
    }


    @Transactional
    protected void registerPlayHistory(User user, Song song) {
        SongHistoryId historyId = new SongHistoryId(song.getIdSong(), user.getIdUser());

        SongHistory history = new SongHistory();
        history.setId(historyId);
        history.setUser(user);
        history.setSong(song);
        history.setDatePlayed(LocalDateTime.now());

        songHistoryRepository.save(history);
    }

}

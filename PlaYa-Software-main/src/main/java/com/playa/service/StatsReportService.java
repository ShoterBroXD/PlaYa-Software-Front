package com.playa.service;

import com.playa.dto.response.ArtistPopularityResponse;
import com.playa.dto.response.ArtistReportResponse;
import com.playa.dto.response.SongPlayReportResponse;
import com.playa.model.SongHistory;
import com.playa.model.User;
import com.playa.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsReportService {

    private final PlayHistoryRepository reportRepository;
    private final SongRepository songRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final SongHistoryRepository playHistoryRepository;

    private final EntityManager entityManager;

    @Transactional
    public ArtistReportResponse getArtistReport(Long artistId) {
        User artist = userRepository.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        List<SongPlayReportResponse> songStats = playHistoryRepository.findSongPlayStatsByArtist(artistId);

        if (songStats.isEmpty()) {
            return new ArtistReportResponse(artistId, artist.getName(), 0L, null, 0L, 0.0, List.of());
        }

        long total = songStats.stream().mapToLong(SongPlayReportResponse::getPlayCount).sum();
        SongPlayReportResponse topSong = songStats.get(0);
        double average = total / (double) songStats.size();

        return new ArtistReportResponse(
                artistId,
                artist.getName(),
                total,
                topSong.getTitle(),
                topSong.getPlayCount(),
                average,
                songStats
        );
    }

    @Transactional
    public List<Map<String, Object>> getGlobalTopSongs() {
        List<Object[]> results = reportRepository.getTopSongsGlobal();
        return results.stream().map(r -> Map.of(
                "title", r[0],
                "plays", r[1]
        )).toList();
    }

    @Transactional(readOnly = true)
    public List<ArtistPopularityResponse> getArtistPopularityReport(Long genreId, LocalDateTime startDate, LocalDateTime endDate) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<SongHistory> root = cq.from(SongHistory.class);

        Join<Object, Object> songJoin = root.join("song");
        Join<Object, Object> artistJoin = songJoin.join("user");
        Join<Object, Object> genreJoin = songJoin.join("genre");

        List<Predicate> predicates = new ArrayList<>();

        if (genreId != null) {
            predicates.add(cb.equal(genreJoin.get("idgenre"), genreId));
        }

        if (startDate != null && endDate != null) {
            predicates.add(cb.between(root.get("dateplayed"), startDate, endDate));
        }

        cq.multiselect(
                artistJoin.get("idUser"),
                artistJoin.get("name"),
                genreJoin.get("name"),
                cb.count(root.get("id"))
        );

        cq.where(predicates.toArray(new Predicate[0]));
        cq.groupBy(artistJoin.get("idUser"), artistJoin.get("name"), genreJoin.get("name"));
        cq.orderBy(cb.desc(cb.count(root.get("id"))));

        List<Object[]> results = entityManager.createQuery(cq).getResultList();

        return results.stream()
                .map(r -> new ArtistPopularityResponse(
                        (Long) r[0],
                        (String) r[1],
                        (String) r[2],
                        (Long) r[3]
                ))
                .collect(Collectors.toList());
    }

    // Estadísticas de artistas emergentes (cuántos hay, por género, etc.)
    @Transactional(readOnly = true)
    public Map<String, Object> getEmergingArtistsStats() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> emerging = userRepository.findEmergingArtists(50L, thirtyDaysAgo);
        
        long totalEmerging = emerging.size();
        long newArtists = emerging.stream()
                .filter(u -> u.getRegisterDate().isAfter(thirtyDaysAgo))
                .count();
        long withFewFollowers = totalEmerging - newArtists;
        
        return Map.of(
                "totalEmergingArtists", totalEmerging,
                "newArtists", newArtists,
                "artistsWithFewFollowers", withFewFollowers,
                "threshold", "50 seguidores o menos de 30 días"
        );
    }

    // Estadísticas de artistas activos vs inactivos
    @Transactional(readOnly = true)
    public Map<String, Object> getArtistActivityStats(Integer days) {
        int daysToCheck = days != null ? days : 30;
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysToCheck);
        
        List<User> activeArtists = userRepository.findActiveArtists(threshold);
        long totalArtists = userRepository.findAll().stream()
                .filter(u -> u.getType().toString().equals("ARTIST"))
                .count();
        
        long activeCount = activeArtists.size();
        long inactiveCount = totalArtists - activeCount;
        double activityRate = totalArtists > 0 ? (activeCount * 100.0 / totalArtists) : 0.0;
        
        return Map.of(
                "totalArtists", totalArtists,
                "activeArtists", activeCount,
                "inactiveArtists", inactiveCount,
                "activityRate", String.format("%.2f%%", activityRate),
                "periodDays", daysToCheck
        );
    }

    // Estadísticas de artistas sin reproducciones (necesitan apoyo)
    @Transactional(readOnly = true)
    public Map<String, Object> getArtistsNeedingSupportStats() {
        List<User> withoutPlays = userRepository.findArtistsWithoutPlays();
        long totalArtists = userRepository.findAll().stream()
                .filter(u -> u.getType().toString().equals("ARTIST"))
                .count();
        
        long withoutPlaysCount = withoutPlays.size();
        long withPlaysCount = totalArtists - withoutPlaysCount;
        double supportRate = totalArtists > 0 ? (withPlaysCount * 100.0 / totalArtists) : 0.0;
        
        return Map.of(
                "totalArtists", totalArtists,
                "artistsWithoutPlays", withoutPlaysCount,
                "artistsWithPlays", withPlaysCount,
                "supportCoverageRate", String.format("%.2f%%", supportRate),
                "message", withoutPlaysCount + " artistas necesitan su primera reproducción"
        );
    }

    // Top artistas emergentes con más crecimiento (nuevos seguidores)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmergingArtistsGrowth(Integer limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> emergingArtists = userRepository.findEmergingArtists(50L, thirtyDaysAgo);
        
        return emergingArtists.stream()
                .limit(limit != null ? limit : 10)
                .map(artist -> {
                    long followersCount = followRepository.countByArtist(artist);
                    long songsCount = songRepository.countByUserIdUser(artist.getIdUser()) instanceof Long ? 
                            (Long) songRepository.countByUserIdUser(artist.getIdUser()) : 0L;
                    
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("artistId", artist.getIdUser());
                    result.put("name", artist.getName());
                    result.put("followers", followersCount);
                    result.put("totalSongs", songsCount);
                    result.put("registerDate", artist.getRegisterDate().toString());
                    result.put("isNew", artist.getRegisterDate().isAfter(thirtyDaysAgo));
                    return result;
                })
                .collect(Collectors.toList());
    }
}


package com.playa.service;

import com.playa.dto.*;
import com.playa.exception.ResourceNotFoundException;
import com.playa.model.Song;
import com.playa.model.SocialShare;
import com.playa.model.User;
import com.playa.repository.SocialShareRepository;
import com.playa.repository.SongRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final SocialShareRepository socialShareRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final int MAX_SHARES_PER_HOUR = 10;

    @Transactional
    public SocialShareResponseDto shareSong(Long userId, SocialShareRequestDto requestDto) {
        // Validar usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Validar canción
        Song song = songRepository.findById(requestDto.getSongId())
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));

        // Validar límite de comparticiones por hora (solo para usuarios no premium)
        if (!user.getPremium()) {
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            Long recentShares = socialShareRepository.countUserSharesSince(user, oneHourAgo);
            if (recentShares >= MAX_SHARES_PER_HOUR) {
                throw new IllegalStateException("Límite de " + MAX_SHARES_PER_HOUR +
                    " comparticiones por hora alcanzado. Actualiza a premium para compartir sin límites.");
            }
        }

        // Generar URL de compartir
        String shareUrl = generateShareUrl(song, requestDto.getPlatform(), requestDto.getMessage());

        // Crear registro de compartir
        SocialShare socialShare = SocialShare.builder()
                .user(user)
                .song(song)
                .platform(requestDto.getPlatform())
                .shareUrl(shareUrl)
                .message(requestDto.getMessage())
                .sharedAt(LocalDateTime.now())
                .success(true)
                .build();

        SocialShare saved = socialShareRepository.save(socialShare);

        return convertToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SocialShareResponseDto> getUserShares(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return socialShareRepository.findByUserOrderBySharedAtDesc(user)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SocialShareResponseDto> getSongShares(Long songId) {
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Canción no encontrada");
        }

        return socialShareRepository.findBySong_IdSongOrderBySharedAtDesc(songId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getSongShareCount(Long songId) {
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Canción no encontrada");
        }
        return socialShareRepository.countSharesBySong(songId);
    }

    @Transactional
    public UserResponseDto updateSocialProfiles(Long userId, SocialProfileRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Construir JSON de redes sociales
        Map<String, String> socialProfiles = new HashMap<>();
        if (requestDto.getFacebookUrl() != null && !requestDto.getFacebookUrl().trim().isEmpty()) {
            socialProfiles.put("facebook", requestDto.getFacebookUrl().trim());
        }
        if (requestDto.getTwitterUrl() != null && !requestDto.getTwitterUrl().trim().isEmpty()) {
            socialProfiles.put("twitter", requestDto.getTwitterUrl().trim());
        }
        if (requestDto.getInstagramUrl() != null && !requestDto.getInstagramUrl().trim().isEmpty()) {
            socialProfiles.put("instagram", requestDto.getInstagramUrl().trim());
        }
        if (requestDto.getYoutubeUrl() != null && !requestDto.getYoutubeUrl().trim().isEmpty()) {
            socialProfiles.put("youtube", requestDto.getYoutubeUrl().trim());
        }
        if (requestDto.getTiktokUrl() != null && !requestDto.getTiktokUrl().trim().isEmpty()) {
            socialProfiles.put("tiktok", requestDto.getTiktokUrl().trim());
        }

        // Convertir a JSON string (simplificado)
        String redSocialJson = socialProfiles.isEmpty() ? null :
            socialProfiles.entrySet().stream()
                .map(entry -> "\"" + entry.getKey() + "\":\"" + entry.getValue() + "\"")
                .collect(Collectors.joining(",", "{", "}"));

        user.setRedSocial(redSocialJson);
        User saved = userRepository.save(user);

        return convertUserToResponseDto(saved);
    }

    private String generateShareUrl(Song song, String platform, String message) {
        String songUrl = baseUrl + "/songs/" + song.getIdSong();
        String defaultMessage = "🎵 Escucha \"" + song.getTitle() + "\" en PlaYa! 🎵";
        String shareMessage = message != null && !message.trim().isEmpty() ? message : defaultMessage;

        try {
            String encodedMessage = URLEncoder.encode(shareMessage, StandardCharsets.UTF_8);
            String encodedUrl = URLEncoder.encode(songUrl, StandardCharsets.UTF_8);

            return switch (platform.toLowerCase()) {
                case "facebook" -> "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl;
                case "twitter" -> "https://twitter.com/intent/tweet?text=" + encodedMessage + "&url=" + encodedUrl;
                case "whatsapp" -> "https://wa.me/?text=" + encodedMessage + " " + encodedUrl;
                case "telegram" -> "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedMessage;
                case "instagram" -> songUrl; // Instagram no permite compartir directo via URL
                default -> songUrl;
            };
        } catch (Exception e) {
            return songUrl;
        }
    }

    private SocialShareResponseDto convertToResponseDto(SocialShare share) {
        return SocialShareResponseDto.builder()
                .shareId(share.getShareId())
                .userId(share.getUser().getIdUser())
                .songId(share.getSong().getIdSong())
                .songTitle(share.getSong().getTitle())
                .platform(share.getPlatform())
                .shareUrl(share.getShareUrl())
                .message(share.getMessage())
                .sharedAt(share.getSharedAt())
                .success(share.getSuccess())
                .build();
    }

    private UserResponseDto convertUserToResponseDto(User user) {
        return UserResponseDto.builder()
                .idUser(user.getIdUser())
                .name(user.getName())
                .email(user.getEmail())
                .type(user.getType())
                .biography(user.getBiography())
                .premium(user.getPremium())
                .redSocial(user.getRedSocial())
                .registerDate(user.getRegisterDate())
                .favoriteGenres(user.getFavoriteGenres())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean canUserShare(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.getPremium()) {
            return true; // Usuarios premium pueden compartir sin límites
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        Long recentShares = socialShareRepository.countUserSharesSince(user, oneHourAgo);
        return recentShares < MAX_SHARES_PER_HOUR;
    }

    @Transactional
    public SocialConnectResponseDto connectSocialNetwork(Long userId, SocialConnectRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Solo artistas pueden vincular redes sociales
        if (!user.getType().name().equals("ARTIST")) {
            throw new IllegalArgumentException("Solo los artistas pueden vincular redes sociales");
        }

        // Simular validación de credenciales (en implementación real se haría llamada a API)
        if (!validateCredentials(requestDto.getPlatform(), requestDto.getCredentials())) {
            throw new IllegalArgumentException("Ingrese las credenciales correctas");
        }

        // Generar URL del perfil basada en las credenciales
        String profileUrl = generateProfileUrl(requestDto.getPlatform(), requestDto.getCredentials());

        // Actualizar el perfil del usuario con la nueva red social
        updateUserSocialProfile(user, requestDto.getPlatform(), profileUrl);

        return SocialConnectResponseDto.builder()
                .platform(requestDto.getPlatform())
                .status("connected")
                .message("Red social vinculada exitosamente")
                .profileUrl(profileUrl)
                .connectedAt(LocalDateTime.now())
                .isActive(true)
                .build();
    }

    private boolean validateCredentials(String platform, String credentials) {
        // Simulación de validación de credenciales
        // En implementación real, se haría llamada a API de la plataforma

        if (credentials == null || credentials.trim().isEmpty()) {
            return false;
        }

        return switch (platform.toLowerCase()) {
            case "facebook" -> credentials.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$") ||
                             credentials.matches("^[a-zA-Z0-9._-]+$");
            case "twitter" -> credentials.startsWith("@") && credentials.length() > 1;
            case "instagram" -> credentials.matches("^[a-zA-Z0-9._-]+$") && credentials.length() >= 3;
            case "youtube" -> credentials.matches("^[a-zA-Z0-9._-]+$") || credentials.contains("youtube.com");
            case "tiktok" -> credentials.startsWith("@") || credentials.matches("^[a-zA-Z0-9._-]+$");
            default -> false;
        };
    }

    private String generateProfileUrl(String platform, String credentials) {
        return switch (platform.toLowerCase()) {
            case "facebook" -> "https://www.facebook.com/" + credentials.replace("@", "");
            case "twitter" -> "https://www.twitter.com/" + credentials.replace("@", "");
            case "instagram" -> "https://www.instagram.com/" + credentials.replace("@", "");
            case "youtube" -> credentials.contains("youtube.com") ? credentials :
                            "https://www.youtube.com/@" + credentials;
            case "tiktok" -> "https://www.tiktok.com/@" + credentials.replace("@", "");
            default -> "";
        };
    }

    private void updateUserSocialProfile(User user, String platform, String profileUrl) {
        String currentRedSocial = user.getRedSocial();
        Map<String, String> socialProfiles = new HashMap<>();

        // Parsear JSON existente si existe
        if (currentRedSocial != null && !currentRedSocial.trim().isEmpty()) {
            try {
                // Parseo simplificado - en producción usar Jackson o Gson
                currentRedSocial = currentRedSocial.replaceAll("[{}]", "");
                String[] pairs = currentRedSocial.split(",");
                for (String pair : pairs) {
                    String[] keyValue = pair.split(":");
                    if (keyValue.length == 2) {
                        String key = keyValue[0].replaceAll("\"", "").trim();
                        String value = keyValue[1].replaceAll("\"", "").trim();
                        socialProfiles.put(key, value);
                    }
                }
            } catch (Exception e) {
                // Si hay error en parseo, empezar con perfil limpio
                socialProfiles.clear();
            }
        }

        // Actualizar con nueva plataforma
        socialProfiles.put(platform, profileUrl);

        // Convertir a JSON string
        String redSocialJson = socialProfiles.entrySet().stream()
                .map(entry -> "\"" + entry.getKey() + "\":\"" + entry.getValue() + "\"")
                .collect(Collectors.joining(",", "{", "}"));

        user.setRedSocial(redSocialJson);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public SongShareLinkDto generateShareLink(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Canción no encontrada"));

        String shareUrl = baseUrl + "/songs/" + songId;
        String shareText = "🎵 Escucha \"" + song.getTitle() + "\" en PlaYa! 🎵";

        // Crear metadatos de la canción
        SongShareLinkDto.SongMetadataDto metadata = SongShareLinkDto.SongMetadataDto.builder()
                .title(song.getTitle())
                .artist(song.getUser() != null ? song.getUser().getName() : "Artista Desconocido")
                .genre(song.getGenre() != null ? song.getGenre().getName() : "Género Desconocido")
                .duration(song.getDuration() > 0 ? Math.round(song.getDuration()) : 0)
                .description(song.getDescription())
                .tags(new String[]{"music", "playa", "streaming"})
                .build();

        return SongShareLinkDto.builder()
                .songId(songId)
                .songTitle(song.getTitle())
                .artistName(song.getUser() != null ? song.getUser().getName() : "Artista Desconocido")
                .coverImageUrl(song.getCoverURL())
                .shareUrl(shareUrl)
                .shareText(shareText)
                .metadata(metadata)
                .build();
    }
}

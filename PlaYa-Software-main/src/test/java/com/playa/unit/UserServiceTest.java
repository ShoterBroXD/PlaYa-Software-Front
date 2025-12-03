package com.playa.unit;

import com.playa.dto.UserRequestDto;
import com.playa.dto.UserResponseDto;
import com.playa.model.enums.Rol;
import com.playa.mapper.UserMapper;
import com.playa.model.User;
import com.playa.repository.GenreRepository;
import com.playa.repository.UserRepository;
import com.playa.service.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserService - Pruebas Unitarias - US-009: Filtrar artistas por género musical")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private EntityManager entityManager;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<User> criteriaQuery;

    @Mock
    private Root<User> root;

    @Mock
    private TypedQuery<User> typedQuery;

    @InjectMocks
    private UserService userService;

    private User artist1;
    private User artist2;

    private UserResponseDto artistRockDto;
    private UserResponseDto artistRock2Dto;

    private User artistRock;
    private User artistRock2;

    private UserResponseDto artistRockDto2;
    private UserResponseDto artistRock2Dto2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(userService, "entityManager", entityManager);

        artist1 = User.builder()
                .idUser(1L)
                .name("Artist One")
                .email("artist1@mail.com")
                .type(Rol.ARTIST)
                .registerDate(LocalDateTime.now().minusDays(3))
                .premium(false)
                .active(true)
                .build();

        artist2 = User.builder()
                .idUser(2L)
                .name("Artist Two")
                .email("artist2@mail.com")
                .type(Rol.ARTIST)
                .registerDate(LocalDateTime.now().minusDays(7))
                .premium(true)
                .active(true)
                .build();

        // Inicializar los artistas/DTOs adicionales (desde e.java)
        artistRock = User.builder()
                .idUser(1L)
                .name("Artista Rock")
                .email("rock@example.com")
                .password("password123")
                .type(Rol.ARTIST)
                .idgenre(1L)
                .registerDate(LocalDateTime.now())
                .premium(false)
                .biography("Especialista en rock")
                .active(true)
                .build();

        artistRock2 = User.builder()
                .idUser(2L)
                .name("Segundo Artista Rock")
                .email("rock2@example.com")
                .password("password123")
                .type(Rol.ARTIST)
                .idgenre(1L)
                .registerDate(LocalDateTime.now())
                .premium(false)
                .biography("También especialista en rock")
                .active(true)
                .build();

        artistRockDto = UserResponseDto.builder()
                .idUser(1L)
                .name("Artista Rock")
                .email("rock@example.com")
                .type(Rol.ARTIST)
                .registerDate(artistRock.getRegisterDate())
                .biography("Especialista en rock")
                .premium(false)
                .build();

        artistRock2Dto = UserResponseDto.builder()
                .idUser(2L)
                .name("Segundo Artista Rock")
                .email("rock2@example.com")
                .type(Rol.ARTIST)
                .registerDate(artistRock2.getRegisterDate())
                .biography("También especialista en rock")
                .premium(false)
                .build();
    }

    @Test
    @DisplayName("CP-035: Mostrar nuevos artistas")
    void getNewArtists_ShouldReturnRecentArtists() {
        // Arrange
        List<User> mockArtists = Arrays.asList(artist1, artist2);

        List<UserResponseDto> mockResponse = mockArtists.stream()
                .map(a -> UserResponseDto.builder()
                        .idUser(a.getIdUser())
                        .name(a.getName())
                        .email(a.getEmail())
                        .type(a.getType())
                        .build())
                .collect(Collectors.toList());

        when(userRepository.findNewArtists(any(LocalDateTime.class))).thenReturn(mockArtists);
        when(userMapper.convertToResponseDto(artist1)).thenReturn(mockResponse.get(0));
        when(userMapper.convertToResponseDto(artist2)).thenReturn(mockResponse.get(1));

        // Act
        List<UserResponseDto> response = userService.getNewArtists(); // usa tu metodo de service

        // Assert
        assertThat(response).isNotNull();
        assertThat(response).hasSize(2);
        assertThat(response.get(0).getName()).isEqualTo("Artist One");
        assertThat(response.get(1).getEmail()).isEqualTo("artist2@mail.com");

        verify(userRepository, times(1)).findNewArtists(any(LocalDateTime.class));
        verify(userMapper, times(2)).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("CP-036: No hay nuevos artistas para mostrar")
    void getNewArtists_ShouldReturnEmptyList_WhenNoNewArtists() {
        // Arrange
        when(userRepository.findNewArtists(any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // Act
        List<UserResponseDto> response = userService.getNewArtists();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response).isEmpty();

        verify(userRepository, times(1)).findNewArtists(any(LocalDateTime.class));
        verifyNoInteractions(userMapper);
    }

    @Test
    @DisplayName("CP-037: Editar usuario correctamente")
    void updateUser_ShouldUpdateAndReturnUpdatedUser() {
        // Arrange
        Long userId = 1L;

        User existingUser = User.builder()
                .idUser(userId)
                .name("Old Name")
                .email("old@mail.com")
                .type(Rol.LISTENER)
                .premium(false)
                .active(true)
                .build();

        UserRequestDto userRequestDto = UserRequestDto.builder()
                .name("New Name")
                .email("new@mail.com")
                .type(Rol.ARTIST)
                .premium(true)
                .build();

        User updatedUser = User.builder()
                .idUser(userId)
                .name("New Name")
                .email("new@mail.com")
                .type(Rol.ARTIST)
                .premium(true)
                .active(true)
                .build();

        UserResponseDto mockResponse = UserResponseDto.builder()
                .idUser(userId)
                .name("New Name")
                .email("new@mail.com")
                .type(Rol.ARTIST)
                .build();

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(userMapper.convertToResponseDto(updatedUser)).thenReturn(mockResponse);

        // Act
        UserResponseDto response = userService.updateUser(userId, userRequestDto);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getIdUser()).isEqualTo(userId);
        assertThat(response.getName()).isEqualTo("New Name");
        assertThat(response.getEmail()).isEqualTo("new@mail.com");
        assertThat(response.getType()).isEqualTo(Rol.ARTIST);

        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).save(any(User.class));
        verify(userMapper, times(1)).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("CP-038: Debe lanzar excepción si el usuario no existe al actualizar")
    void updateUser_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        Long invalidId = 99L;
        UserRequestDto userRequestDto = UserRequestDto.builder()
                .name("Doesn't Matter")
                .email("no@mail.com")
                .type(Rol.LISTENER)
                .premium(false)
                .build();

        when(userRepository.findById(invalidId)).thenReturn(java.util.Optional.empty());

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> userService.updateUser(invalidId, userRequestDto)
        );

        verify(userRepository, times(1)).findById(invalidId);
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(userMapper);
    }


    @Test
    @DisplayName("US-009 - Escenario 01: Debe mostrar únicamente artistas del género seleccionado (Rock)")
    void filterArtists_whenSelectRockGenre_returnsOnlyRockArtists() {
        Long genreIdRock = 1L;
        List<User> rockArtists = Arrays.asList(artistRock, artistRock2); // 2 artistas de rock

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(User.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(User.class)).thenReturn(root);
        when(criteriaQuery.select(root)).thenReturn(criteriaQuery);
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(rockArtists);

        when(userMapper.convertToResponseDto(artistRock)).thenReturn(artistRockDto);
        when(userMapper.convertToResponseDto(artistRock2)).thenReturn(artistRock2Dto);

        // When aplico el filtro por género Rock
        List<UserResponseDto> result = userService.filterArtists(Rol.ARTIST, null, genreIdRock);

        // Then se muestran únicamente artistas de ese género (Rock)
        assertNotNull(result, "El resultado no debe ser nulo");
        assertEquals(2, result.size(), "Debe retornar exactamente 2 artistas de rock");

        // Verificar que todos son de tipo ARTIST
        assertTrue(result.stream().allMatch(dto -> dto.getType() == Rol.ARTIST),
                "Todos deben ser artistas");

        // Verificar que ambos artistas son de Rock
        assertTrue(result.stream().anyMatch(dto -> dto.getName().equals("Artista Rock")),
                "Debe incluir al primer artista de rock");
        assertTrue(result.stream().anyMatch(dto -> dto.getName().equals("Segundo Artista Rock")),
                "Debe incluir al segundo artista de rock");

        verify(entityManager, times(1)).getCriteriaBuilder();
        verify(userMapper, times(2)).convertToResponseDto(any(User.class));
    }

    @Test
    @DisplayName("US-009 - Escenario 02: Debe mostrar mensaje cuando el género no tiene artistas")
    void filterArtists_whenGenreHasNoArtists_returnsEmptyList() {
        // Given que el usuario selecciona un género inexistente o sin artistas (ID: 999)
        Long nonExistentGenreId = 999L;
        List<User> emptyList = Collections.emptyList();

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(User.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(User.class)).thenReturn(root);
        when(criteriaQuery.select(root)).thenReturn(criteriaQuery);
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(emptyList);

        List<UserResponseDto> result = userService.filterArtists(Rol.ARTIST, null, nonExistentGenreId);

        // Then aparece el mensaje "No se encontraron resultados" (lista vacía)
        assertNotNull(result, "El resultado debe ser una lista, no null");
        assertTrue(result.isEmpty(),
                "La lista debe estar vacía cuando no hay artistas del género (equivalente a 'No se encontraron resultados')");

        verify(entityManager, times(1)).getCriteriaBuilder();
        verify(userMapper, never()).convertToResponseDto(any(User.class));
    }
}

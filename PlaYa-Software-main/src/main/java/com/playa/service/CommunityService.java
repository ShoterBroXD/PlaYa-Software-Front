package com.playa.service;

import com.playa.dto.CommunityRequestDto;
import com.playa.dto.CommunityResponseDto;
import com.playa.dto.JoinCommunityDto;
import com.playa.dto.UserResponseDto;
import com.playa.exception.ResourceNotFoundException;
import com.playa.mapper.CommunityMapper;
import com.playa.model.Community;
import com.playa.model.CommunityUser;
import com.playa.model.CommunityUserId;
import com.playa.model.User;
import com.playa.repository.CommunityRepository;
import com.playa.repository.CommunityUserRepository;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityUserRepository communityUserRepository;
    private final UserRepository userRepository;
    private final CommunityMapper communityMapper;

    @Transactional
    public CommunityResponseDto createCommunity(CommunityRequestDto requestDto) {
        Community community = Community.builder()
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .creationDate(LocalDateTime.now())
                .build();

        Community savedCommunity = communityRepository.save(community);
        return communityMapper.convertToResponseDto(savedCommunity);
    }

    @Transactional(readOnly = true)
    public CommunityResponseDto getCommunityById(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidad no encontrada con ID: " + id));

        // Obtener los miembros de la comunidad
        List<CommunityUser> communityUsers = communityUserRepository.findByCommunityIdOrderByJoinDateAsc(id);
        List<UserResponseDto> members = communityUsers.stream()
                .map(cu -> {
                    // Cargar el usuario directamente desde el repository para evitar lazy loading
                    User user = userRepository.findById(cu.getId().getIdUser())
                            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                    return convertUserToResponseDto(user);
                })
                .collect(Collectors.toList());

        CommunityResponseDto responseDto = communityMapper.convertToResponseDto(community);
        responseDto.setMembers(members);
        return responseDto;
    }

    @Transactional
    public void joinCommunity(Long communityId, JoinCommunityDto requestDto) {
        // Validar que la comunidad existe
        if (!communityRepository.existsById(communityId)) {
            throw new ResourceNotFoundException("Comunidad no encontrada con ID: " + communityId);
        }

        // Validar que el usuario existe
        if (!userRepository.existsById(requestDto.getIdUser())) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + requestDto.getIdUser());
        }

        // Verificar que el usuario no esté ya en la comunidad
        if (communityUserRepository.existsByIdIdCommunityAndIdIdUser(communityId, requestDto.getIdUser())) {
            throw new IllegalArgumentException("El usuario ya es miembro de esta comunidad");
        }

        CommunityUserId communityUserId = CommunityUserId.builder()
                .idCommunity(communityId)
                .idUser(requestDto.getIdUser())
                .build();

        CommunityUser communityUser = CommunityUser.builder()
                .id(communityUserId)
                .joinDate(LocalDateTime.now())
                .build();

        communityUserRepository.save(communityUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getCommunityMembers(Long communityId) {
        // Validar que la comunidad existe
        if (!communityRepository.existsById(communityId)) {
            throw new ResourceNotFoundException("Comunidad no encontrada con ID: " + communityId);
        }

        List<CommunityUser> communityUsers = communityUserRepository.findByCommunityIdOrderByJoinDateAsc(communityId);
        return communityUsers.stream()
                .map(cu -> {
                    User user = userRepository.findById(cu.getId().getIdUser())
                            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                    return convertUserToResponseDto(user);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommunityResponseDto> getAllCommunities() {
        List<Community> communities = communityRepository.findAllOrderByCreationDateDesc();
        return communities.stream()
                .map(communityMapper::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCommunity(Long id) {
        if (!communityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Comunidad no encontrada con ID: " + id);
        }

        // Primero eliminar todos los miembros de la comunidad
        List<CommunityUser> communityUsers = communityUserRepository.findByIdIdCommunity(id);
        communityUserRepository.deleteAll(communityUsers);

        // Luego eliminar la comunidad
        communityRepository.deleteById(id);
    }

    private UserResponseDto convertUserToResponseDto(User user) {
        return UserResponseDto.builder()
                .idUser(user.getIdUser())
                .name(user.getName())
                .email(user.getEmail())
                .type(user.getType())
                .registerDate(user.getRegisterDate())
                .biography(user.getBiography())
                .redSocial(user.getRedSocial())
                .build();
    }
}
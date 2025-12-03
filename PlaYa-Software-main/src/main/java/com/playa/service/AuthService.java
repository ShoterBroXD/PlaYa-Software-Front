package com.playa.service;

import com.playa.dto.request.LoginRequest;
import com.playa.dto.request.RegisterRequest;
import com.playa.dto.response.AuthResponse;
import com.playa.exception.DuplicateEmailException;
import com.playa.exception.RoleNotFoundException;
import com.playa.model.Role;
import com.playa.model.RoleType;
import com.playa.model.User;
import com.playa.repository.RoleRepository;
import com.playa.repository.UserRepository;
import com.playa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("El correo ya está registrado");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .type(request.type())
                .registerDate(LocalDateTime.now())
                .premium(false)
                .active(true)
                .build();

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseThrow(() -> new RoleNotFoundException("Role ROLE_USER not found"));
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getName(), savedUser.getIdUser(), savedUser.getType());

        return new AuthResponse(token, savedUser.getEmail(), savedUser.getName(), savedUser.getType());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getName(), user.getIdUser() , user.getType());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getType());
    }
}

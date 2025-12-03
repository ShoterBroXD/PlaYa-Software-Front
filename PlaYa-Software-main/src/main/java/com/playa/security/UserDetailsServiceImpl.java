package com.playa.security;

import com.playa.model.User;
import com.playa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        // Usar el tipo de usuario (Rol) para las autoridades - asegurar que siempre hay un rol
        String roleAuthority = user.getType() != null ? user.getType().name() : "LISTENER";

        // Debug log para verificar qué rol se está asignando
        System.out.println("DEBUG: Usuario " + email + " tiene tipo: " + user.getType() + " -> authority: ROLE_" + roleAuthority);

        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + roleAuthority)
        );

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getActive() != null ? user.getActive() : true, // Asegurar que no sea null
                true,
                true,
                true,
                authorities
        );
    }
}
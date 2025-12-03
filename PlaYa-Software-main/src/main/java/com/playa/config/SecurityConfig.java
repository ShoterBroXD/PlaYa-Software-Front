package com.playa.config;

import com.playa.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Actuator endpoints (Health Check)
                        .requestMatchers("/actuator/**").permitAll()
                        // Swagger/OpenAPI endpoints
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/v3/api-docs.yaml").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        .requestMatchers("/register").permitAll()
                        .requestMatchers("/notifications/**").permitAll()
                        .requestMatchers("/notifications/preferences").permitAll()
                        .requestMatchers("/notifications/preferences/edit").permitAll()
                        .requestMatchers("/player/**").permitAll()
                        .requestMatchers("/users/artists/**").permitAll()
                        .requestMatchers("/users/emerging/**").permitAll()
                        .requestMatchers("/users/active-artists").permitAll()
                        .requestMatchers("/users/password/**").permitAll()
                        // Public song endpoints (GET requests for public songs)
                        .requestMatchers("/songs/public").permitAll()
                        .requestMatchers("/songs/*/comments").permitAll()
                        // Reports endpoints
                        .requestMatchers("/stats/**").permitAll()
                        .requestMatchers("/api/v1/follows/**").permitAll()
                        .requestMatchers("/follows/**").permitAll()
                        // Premium functionality endpoints - require authentication and premium validation
                        .requestMatchers("/reports/**").authenticated()
                        .requestMatchers("/users/*/preferences/**").authenticated()
                        .requestMatchers("/premium/**").authenticated()
                        // Songs endpoints - require authentication and role validation
                        .requestMatchers("/songs/**").authenticated()
                        // Playlists endpoints - require authentication
                        .requestMatchers("/playlists/**").authenticated()
                        // Comments endpoints - require authentication
                        .requestMatchers("/comments/**").authenticated()
                        .requestMatchers("/users/**").authenticated()
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
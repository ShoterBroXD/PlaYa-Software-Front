package com.playa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Permite que el frontend (React, Angular, etc.) en diferentes puertos pueda consumir la API REST.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Orígenes permitidos (en producción, especificar dominios exactos)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",    // React dev server
                "http://localhost:4200",     // Angular dev server
                "https://playa-software-front-seven.vercel.app",
                "https://playa-software-front-git-main-shoterbroxds-projects.vercel.app",
                "https://playa-software-front-j8uy7b7hx-shoterbroxds-projects.vercel.app"
        ));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Headers permitidos (todos)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Permitir credenciales (cookies, Authorization header con JWT)
        configuration.setAllowCredentials(true);

        // Headers expuestos al cliente JavaScript
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Tiempo de cache de la configuración CORS (1 hora)
        configuration.setMaxAge(3600L);

        // Aplicar configuración a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
package com.travelbuddy.travelbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.travelbuddy.travelbuddy.JWT.JWTValidation;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security configuration class that provides security-related beans and configures security rules.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Provides a BCryptPasswordEncoder bean for password encryption.
     * BCrypt is a strong password hashing algorithm that automatically handles salt generation.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures security rules for the application.
     * Currently allows access to H2 console and disables CSRF for it.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JWTValidation jwtValidation) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**", "/api/users/login", "/api/users/register", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // Admin-only endpoints
                .anyRequest().permitAll() // Temporarily permit all requests for accessibility
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())) // Required for H2 console
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**", "/api/**", "/swagger-ui/**")) // Disable CSRF for H2 console and API
            .addFilterBefore(jwtValidation, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Your API")
                .version("1.0")
                .description("API with JWT Auth")
            )
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
} 
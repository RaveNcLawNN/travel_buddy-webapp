package com.travelbuddy.travelbuddy.JWT;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.service.UserService;

import java.io.IOException;
import java.util.Collections;

// This class is used to validate the JWT token for the user. It is used in the SecurityConfig class.
@Component
public class JWTValidation extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final UserService userService;

    public JWTValidation(JWTUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    //doFilterInternal is the method that is used to validate the JWT token for the user.
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // If the authHeader is not null and starts with "Bearer ", we can extract the token.
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // remove "Bearer " prefix

            try {
                String username = jwtUtil.validateToken(token); // validate + extract subject
                User user = userService.findByUsername(username).orElse(null);
                if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create an authentication token and set it into the security context
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException e) {
                // Optional: Log or respond with error
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }
        }

        // Continue filter chain. the chain is the list of filters that are applied to the request. the list of 
        // filters are defined in the SecurityConfig class.
        filterChain.doFilter(request, response);
    }
}

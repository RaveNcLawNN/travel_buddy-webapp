package com.travelbuddy.travelbuddy.JWT;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.travelbuddy.travelbuddy.model.User;

// This class is used to generate and validate JWT tokens for the user.
@Component
public class JWTUtil {
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public String generateToken(User user) {
        // Create a JWT token with the user's details
        return Jwts.builder()
                .setSubject(user.getUsername()) // Set the username as the subject
                .claim("id", user.getId()) // Add the user's ID as a claim
                .claim("role", user.getRole()) // Add the user's role as a claim
                .setIssuedAt(new Date()) // Set the token's issue date
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // Set the token's expiration (1 hour)
                .signWith(key) // Sign the token with the secret key
                .compact(); // Build the token
    }

    // This method is used to validate the JWT token, i.e. check if the token is valid and not expired.
    public String validateToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            return claims.getBody().getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}

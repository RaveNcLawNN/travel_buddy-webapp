package com.travelbuddy.travelbuddy.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Represents a user in the TravelBuddy application.
 * This entity is mapped to the 'users' table in the database.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /**
     * The unique identifier for each user (Primary Key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The unique username of the user.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * The email address of the user.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * The hashed password of the user.
     */
    @Column(nullable = false)
    private String password;

    /**
     * The role of the user (e.g., 'ADMIN', 'USER').
     */
    @Column(nullable = false)
    private String role;

    // Future: Add relationships to trips, friends, etc.
} 
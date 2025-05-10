package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.service.UserService;
import com.travelbuddy.travelbuddy.dto.UserRegistrationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST controller for user-related operations.
 * Handles HTTP requests for user registration and user information retrieval.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /**
     * Constructor-based dependency injection for UserService.
     * @param userService the service for user business logic
     */
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Registers a new user.
     *
     * @param registrationDto the registration data (username, email, password)
     * @return HTTP 201 Created if successful, 400 Bad Request if username/email exists
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        // Check if username or email already exists
        if (userService.existsByUsername(registrationDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }
        if (userService.existsByEmail(registrationDto.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }
        // Map DTO to User entity
        User user = new User(
            registrationDto.getUsername(),
            registrationDto.getEmail(),
            registrationDto.getPassword() // In production, hash the password!
        );
        User savedUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /**
     * Retrieves user information by username.
     *
     * @param username the username to search for
     * @return the user info if found, 404 Not Found otherwise
     */
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    // Future: Add endpoints for updating and deleting users, listing all users, etc.
} 
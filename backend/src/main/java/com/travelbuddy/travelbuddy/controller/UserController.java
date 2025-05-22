package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.service.UserService;
import com.travelbuddy.travelbuddy.dto.UserDto;
import com.travelbuddy.travelbuddy.mapper.UserMapper;
import jakarta.validation.Valid;
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
    private final UserMapper userMapper;

    /**
     * Constructor-based dependency injection for UserService and UserMapper.
     * @param userService the service for user business logic
     * @param userMapper the mapper for converting DTOs to entities
     */
    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    /**
     * Registers a new user.
     *
     * @param userDto the registration data (username, email, password)
     * @return HTTP 201 Created if successful, 400 Bad Request if username/email exists
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto) {
        // Check if username or email already exists
        if (userService.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }
        if (userService.existsByEmail(userDto.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }
        // Map DTO to User entity
        User user = userMapper.toEntity(userDto);
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
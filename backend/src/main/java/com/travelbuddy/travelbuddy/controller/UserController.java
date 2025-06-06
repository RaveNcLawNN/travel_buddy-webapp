package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.service.UserService;
import com.travelbuddy.travelbuddy.JWT.JWTUtil;
import com.travelbuddy.travelbuddy.dto.UserDto;
import com.travelbuddy.travelbuddy.dto.BuddyDto;
import com.travelbuddy.travelbuddy.dto.LoginDto;
import com.travelbuddy.travelbuddy.mapper.UserMapper;
import com.travelbuddy.travelbuddy.mapper.BuddyMapper;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * REST controller for user-related operations.
 * Handles HTTP requests for user registration and user information retrieval.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final BuddyMapper buddyMapper;
    private final JWTUtil jwtUtil;

    @Autowired
    PasswordEncoder passwordEncoder;

    /**
     * Constructor-based dependency injection for UserService and UserMapper.
     * @param userService the service for user business logic
     * @param userMapper the mapper for converting DTOs to entities
     */
    public UserController(UserService userService, UserMapper userMapper, BuddyMapper buddyMapper, JWTUtil jwtUtil) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.buddyMapper = buddyMapper;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registers a new user.
     *
     * @param userDto the registration data (username, email, password)
     * @return HTTP 201 Created if successful, 400 Bad Request if username/email exists
     */
    @Operation(summary = "Register a new user", description = "Registers a new user with username, email, and password.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User registration data",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"username\": \"john_doe\", \"email\": \"john@example.com\", \"password\": \"password123\"}"))
        ),
        responses = {
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Username or email already exists")
        }
    )
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
    @Operation(summary = "Get user by username", description = "Retrieves user information by username.",
        parameters = @Parameter(name = "username", description = "Username to search for", example = "john_doe"),
        responses = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    /**
     * Retrieves user information by user ID.
     *
     * @param id the user ID to search for
     * @return the user info if found, 404 Not Found otherwise
     */
    @Operation(summary = "Get user by ID", description = "Retrieves user information by user ID.",
        parameters = @Parameter(name = "id", description = "User ID to search for", example = "1"),
        responses = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    @GetMapping("/id/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    /**
     * Updates user information by username.
     *
     * @param username the username to update
     * @param userDto the updated user data
     * @return the updated user info if found, 404 Not Found otherwise
     */
    @Operation(summary = "Update user by username", description = "Updates user information by username.",
        parameters = @Parameter(name = "username", description = "Username to update", example = "john_doe"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated user data",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"username\": \"john_doe\", \"email\": \"john_new@example.com\", \"password\": \"newpassword123\"}"))
        ),
        responses = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUserByUsername(@PathVariable String username, @Valid @RequestBody UserDto userDto) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEmail(userDto.getEmail());
            user.setPassword(userDto.getPassword()); // In real apps, hash the password!
            userService.registerUser(user);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    /**
     * Deletes a user by username.
     *
     * @param username the username to delete
     * @return 204 No Content if deleted, 404 Not Found otherwise
     */
    @Operation(summary = "Delete user by username", description = "Deletes a user by their username.",
        parameters = @Parameter(name = "username", description = "Username to delete", example = "john_doe"),
        responses = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUserByUsername(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            userService.deleteUser(userOpt.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    // Future: Add endpoints for updating and deleting users, listing all users, etc.
    
    /**
     * Authenticates a User at login and returns session token.
     *
     * @param loginDto the login credentials (username, password)
     * @return 200 OK if successfully authenticated, 401 Unauthorized if username or password is incorrect.
     */
    @Operation(summary = "User login", description = "Authenticates a user and returns a session token.\n\nRequired fields in the request body:\n- username (string)\n- password (string)",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Login credentials. Example includes all required fields.",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"username\": \"john_doe\", \"password\": \"password123\"}"))
        ),
        responses = {
            @ApiResponse(responseCode = "200", description = "Authenticated successfully, returns JWT token"),
            @ApiResponse(responseCode = "401", description = "Username or password incorrect")
        }
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        System.out.println("Login attempt - Username: " + loginDto.getUsername());
        
        User loginUser = userService.findByUsername(loginDto.getUsername()).orElse(null);
        System.out.println("User found: " + (loginUser != null));

        if (loginUser != null && passwordEncoder.matches(loginDto.getPassword(), loginUser.getPassword())) {
                String token = jwtUtil.generateToken(loginUser);
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @Operation(summary = "Send a buddy request", description = "Sends a buddy request to another user.")
    @PostMapping("/{username}/buddy-request/{buddyUsername}")
    public ResponseEntity<?> sendBuddyRequest(
            @PathVariable String username,
            @PathVariable String buddyUsername) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            User buddy = userService.findByUsername(buddyUsername)
                    .orElseThrow(() -> new IllegalStateException("Buddy not found"));

            Buddy buddyRequest = userService.sendBuddyRequest(user, buddy);
            return ResponseEntity.ok(buddyMapper.toDto(buddyRequest, user));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Accept a buddy request", description = "Accepts a pending buddy request.")
    @PostMapping("/{username}/buddy-request/{buddyId}/accept")
    public ResponseEntity<?> acceptBuddyRequest(
            @PathVariable String username,
            @PathVariable Long buddyId) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            Buddy buddy = userService.acceptBuddyRequest(buddyId, user);
            return ResponseEntity.ok(buddyMapper.toDto(buddy, user));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Reject a buddy request", description = "Rejects a pending buddy request.")
    @PostMapping("/{username}/buddy-request/{buddyId}/reject")
    public ResponseEntity<?> rejectBuddyRequest(
            @PathVariable String username,
            @PathVariable Long buddyId) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            userService.rejectBuddyRequest(buddyId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Get all buddies", description = "Retrieves all accepted buddy relationships for a user.")
    @GetMapping("/{username}/buddies")
    public ResponseEntity<?> getBuddies(@PathVariable String username) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            List<Buddy> buddies = userService.getBuddies(user);
            List<BuddyDto> buddyDtos = buddies.stream()
                    .map(b -> buddyMapper.toDto(b, user))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(buddyDtos);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
            }
    }

    @Operation(summary = "Get pending buddy requests", description = "Retrieves all pending buddy requests for a user.")
    @GetMapping("/{username}/buddy-requests/pending")
    public ResponseEntity<?> getPendingBuddyRequests(@PathVariable String username) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            List<Buddy> pendingRequests = userService.getPendingBuddyRequests(user);
            List<BuddyDto> buddyDtos = pendingRequests.stream()
                    .map(b -> buddyMapper.toDto(b, user))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(buddyDtos);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Get sent buddy requests", description = "Retrieves all sent buddy requests by a user.")
    @GetMapping("/{username}/buddy-requests/sent")
    public ResponseEntity<?> getSentBuddyRequests(@PathVariable String username) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            List<Buddy> sentRequests = userService.getSentBuddyRequests(user);
            List<BuddyDto> buddyDtos = sentRequests.stream()
                    .map(b -> buddyMapper.toDto(b, user))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(buddyDtos);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Remove a buddy", description = "Removes a buddy relationship.")
    @DeleteMapping("/{username}/buddies/{buddyId}")
    public ResponseEntity<?> removeBuddy(
            @PathVariable String username,
            @PathVariable Long buddyId) {
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            userService.removeBuddy(buddyId, user);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
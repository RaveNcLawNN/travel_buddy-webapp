package com.travelbuddy.travelbuddy.service;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service class for user-related business logic.
 * Handles user registration and user lookup operations.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /**
     * Constructor-based dependency injection for UserRepository.
     * @param userRepository the repository for user data access
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Registers a new user in the system.
     * @param user the user to register
     * @return the saved user entity
     */
    public User registerUser(User user) {
        // In a real application, you should hash the password here!
        return userRepository.save(user);
    }

    /**
     * Finds a user by their username.
     * @param username the username to search for
     * @return an Optional containing the found user, or empty if not found
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Finds a user by their email address.
     * @param email the email to search for
     * @return an Optional containing the found user, or empty if not found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Checks if a user exists with the given username.
     * @param username the username to check
     * @return true if a user exists with the username, false otherwise
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Checks if a user exists with the given email address.
     * @param email the email to check
     * @return true if a user exists with the email, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Finds a user by their ID.
     * @param id the user ID
     * @return an Optional containing the found user, or empty if not found
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }
} 
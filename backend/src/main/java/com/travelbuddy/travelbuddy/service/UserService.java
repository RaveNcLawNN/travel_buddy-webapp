package com.travelbuddy.travelbuddy.service;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import com.travelbuddy.travelbuddy.repository.BuddyRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for user-related business logic.
 * Handles user registration and user lookup operations.
 */
@Service
public class UserService {

    public final UserRepository userRepository;
    private final BuddyRepository buddyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructor-based dependency injection for UserRepository, BuddyRepository, and PasswordEncoder.
     * @param userRepository the repository for user data access
     * @param buddyRepository the repository for buddy data access
     * @param passwordEncoder the password encoder for encoding passwords
     */
    public UserService(UserRepository userRepository, BuddyRepository buddyRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.buddyRepository = buddyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user in the system.
     * @param user the user to register
     * @return the saved user entity
     */
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Ensure role is set and always uppercase
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER"); // Default role
        } else {
            user.setRole(user.getRole().toUpperCase());
        }
        return userRepository.save(user);
    }

    /**
     * Initializes the admin user if it doesn't exist.
     */
    public void initializeAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("123"))
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
        }
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

    @Transactional
    public Buddy sendBuddyRequest(User user, User buddy) {
        // Check if a relationship already exists
        Optional<Buddy> existingRelationship = buddyRepository.findBuddyRelationship(user, buddy);
        if (existingRelationship.isPresent()) {
            throw new IllegalStateException("A buddy relationship already exists between these users");
        }

        // Create new buddy relationship
        Buddy newBuddy = Buddy.builder()
                .user(user)
                .buddy(buddy)
                .accepted(false)
                .createdAt(LocalDateTime.now())
                .build();

        return buddyRepository.save(newBuddy);
    }

    @Transactional
    public Buddy acceptBuddyRequest(Long buddyId, User user) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new IllegalStateException("Buddy request not found"));

        if (!buddy.getBuddy().equals(user)) {
            throw new IllegalStateException("This buddy request is not for you");
        }

        buddy.setAccepted(true);
        buddy.setAcceptedAt(LocalDateTime.now());
        return buddyRepository.save(buddy);
    }

    @Transactional
    public void rejectBuddyRequest(Long buddyId, User user) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new IllegalStateException("Buddy request not found"));

        if (!buddy.getBuddy().equals(user)) {
            throw new IllegalStateException("This buddy request is not for you");
        }

        buddyRepository.delete(buddy);
    }

    public List<Buddy> getBuddies(User user) {
        return buddyRepository.findAllBuddies(user);
    }

    public List<Buddy> getPendingBuddyRequests(User user) {
        return buddyRepository.findPendingBuddyRequests(user);
    }

    public List<Buddy> getSentBuddyRequests(User user) {
        return buddyRepository.findSentBuddyRequests(user);
    }

    @Transactional
    public void removeBuddy(Long buddyId, User user) {
        Buddy buddy = buddyRepository.findById(buddyId)
                .orElseThrow(() -> new IllegalStateException("Buddy relationship not found"));

        if (!buddy.getUser().equals(user) && !buddy.getBuddy().equals(user)) {
            throw new IllegalStateException("You are not part of this buddy relationship");
        }

        buddyRepository.delete(buddy);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
} 
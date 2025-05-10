package com.travelbuddy.travelbuddy.dto;

/**
 * Data Transfer Object for user registration requests.
 * Contains only the necessary fields for registering a new user.
 */
public class UserRegistrationDto {

    /**
     * The username chosen by the user.
     */
    private String username;

    /**
     * The email address of the user.
     */
    private String email;

    /**
     * The password chosen by the user (should be hashed before storing).
     */
    private String password;

    // Default constructor
    public UserRegistrationDto() {}

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 
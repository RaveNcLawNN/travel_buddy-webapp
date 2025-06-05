package com.travelbuddy.travelbuddy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for user information.
 * Used for transferring user data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    /**
     * The username chosen by the user.
     */
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    /**
     * The email address of the user.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * The password chosen by the user (should be hashed before storing).
     */
    @NotBlank(message = "Password is required")
    @Size(min = 1, message = "Password must be at least 1 character")
    private String password;
} 
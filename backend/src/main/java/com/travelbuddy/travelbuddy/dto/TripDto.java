package com.travelbuddy.travelbuddy.dto;

import com.travelbuddy.travelbuddy.model.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for trip information.
 * Used for transferring trip data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDto {
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Destination is required")
    @Size(max = 100, message = "Destination must be less than 100 characters")
    private String destination;

    @NotNull(message = "Organizer ID is required")
    private Long organizerId;

    private TripStatus status;

    private Double latitude;
    private Double longitude;
    private List<LocationDto> locations;

    // Add participant usernames
    private List<String> participantUsernames;
} 
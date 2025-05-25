package com.travelbuddy.travelbuddy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for location information.
 * Used for transferring location data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;
    private String type;
    private String description;
    private Long tripId;
} 
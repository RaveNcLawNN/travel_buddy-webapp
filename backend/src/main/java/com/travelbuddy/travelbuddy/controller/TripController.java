package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.dto.TripDto;
import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.service.TripService;
import com.travelbuddy.travelbuddy.service.UserService;
import com.travelbuddy.travelbuddy.mapper.TripMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for trip-related operations.
 * Handles HTTP requests for trip management.
 */
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;
    private final UserService userService;
    private final TripMapper tripMapper;

    public TripController(TripService tripService, UserService userService, TripMapper tripMapper) {
        this.tripService = tripService;
        this.userService = userService;
        this.tripMapper = tripMapper;
    }

    /**
     * Creates a new trip.
     * @param tripDto the trip data
     * @return the created trip
     */
    @Operation(summary = "Create a new trip", description = "Creates a new trip with the provided details.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Trip data",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"title\": \"Summer Vacation\", \"description\": \"Trip to Paris\", \"startDate\": \"2024-07-01\", \"endDate\": \"2024-07-07\", \"destination\": \"Paris\", \"organizerId\": 1}"))
        ),
        responses = {
            @ApiResponse(responseCode = "201", description = "Trip created successfully"),
            @ApiResponse(responseCode = "404", description = "Organizer not found")
        }
    )
    @PostMapping
    public ResponseEntity<?> createTrip(@Valid @RequestBody TripDto tripDto) {
        Optional<User> organizerOpt = userService.findById(tripDto.getOrganizerId());
        if (organizerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organizer not found");
        }

        Trip trip = tripMapper.toEntity(tripDto);
        trip.setOrganizer(organizerOpt.get());
        trip.addParticipant(organizerOpt.get());

        Trip savedTrip = tripService.createTrip(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(tripMapper.toDto(savedTrip));
    }

    /**
     * Gets a trip by its ID.
     * @param id the trip ID
     * @return the trip if found
     */
    @Operation(summary = "Get a trip by ID", description = "Retrieves a trip by its unique ID.",
        parameters = @Parameter(name = "id", description = "Trip ID", example = "1"),
        responses = {
            @ApiResponse(responseCode = "200", description = "Trip found"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
        }
    )
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrip(@PathVariable Long id) {
        Optional<Trip> tripOpt = tripService.findById(id);
        if (tripOpt.isPresent()) {
            return ResponseEntity.ok(tripMapper.toDto(tripOpt.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found");
    }

    /**
     * Gets all trips organized by a user.
     * @param organizerId the organizer's ID
     * @return list of trips
     */
    @Operation(summary = "Get all trips organized by a user", description = "Retrieves all trips organized by the specified user.",
        parameters = @Parameter(name = "organizerId", description = "Organizer's user ID", example = "1"),
        responses = @ApiResponse(responseCode = "200", description = "List of trips")
    )
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getTripsByOrganizer(@PathVariable Long organizerId) {
        List<Trip> trips = tripService.findByOrganizer(organizerId);
        return ResponseEntity.ok(trips.stream().map(tripMapper::toDto).toList());
    }

    /**
     * Gets all trips where a user is a participant.
     * @param userId the user's ID
     * @return list of trips
     */
    @Operation(summary = "Get all trips where a user is a participant", description = "Retrieves all trips where the specified user is a participant.",
        parameters = @Parameter(name = "userId", description = "User ID", example = "2"),
        responses = @ApiResponse(responseCode = "200", description = "List of trips")
    )
    @GetMapping("/participant/{userId}")
    public ResponseEntity<?> getTripsByParticipant(@PathVariable Long userId) {
        List<Trip> trips = tripService.findByParticipant(userId);
        return ResponseEntity.ok(trips.stream().map(tripMapper::toDto).toList());
    }

    /**
     * Gets trips by status.
     * @param status the trip status
     * @return list of trips
     */
    @Operation(summary = "Get trips by status", description = "Retrieves all trips with the specified status.",
        parameters = @Parameter(name = "status", description = "Trip status", example = "PLANNING"),
        responses = @ApiResponse(responseCode = "200", description = "List of trips")
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTripsByStatus(@PathVariable TripStatus status) {
        List<Trip> trips = tripService.findByStatus(status);
        return ResponseEntity.ok(trips.stream().map(tripMapper::toDto).toList());
    }

    /**
     * Gets trips between two dates.
     * @param startDate the start date
     * @param endDate the end date
     * @return list of trips
     */
    @Operation(summary = "Get trips between two dates", description = "Retrieves all trips happening between the specified start and end dates.",
        parameters = {
            @Parameter(name = "startDate", description = "Start date (yyyy-MM-dd)", example = "2024-07-01"),
            @Parameter(name = "endDate", description = "End date (yyyy-MM-dd)", example = "2024-07-07")
        },
        responses = @ApiResponse(responseCode = "200", description = "List of trips")
    )
    @GetMapping("/dates")
    public ResponseEntity<?> getTripsBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<Trip> trips = tripService.findTripsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(trips.stream().map(tripMapper::toDto).toList());
    }

    /**
     * Gets trips by destination.
     * @param destination the destination to search for
     * @return list of trips
     */
    @Operation(summary = "Get trips by destination", description = "Retrieves all trips with the specified destination.",
        parameters = @Parameter(name = "destination", description = "Destination name", example = "Paris"),
        responses = @ApiResponse(responseCode = "200", description = "List of trips")
    )
    @GetMapping("/destination")
    public ResponseEntity<?> getTripsByDestination(@RequestParam String destination) {
        List<Trip> trips = tripService.findByDestination(destination);
        return ResponseEntity.ok(trips.stream().map(tripMapper::toDto).toList());
    }

    /**
     * Adds a participant to a trip.
     * @param tripId the trip ID
     * @param userId the user ID to add
     * @return success message
     */
    @Operation(summary = "Add a participant to a trip", description = "Adds a user as a participant to the specified trip.",
        parameters = {
            @Parameter(name = "tripId", description = "Trip ID", example = "1"),
            @Parameter(name = "userId", description = "User ID to add", example = "2")
        },
        responses = {
            @ApiResponse(responseCode = "200", description = "Participant added successfully"),
            @ApiResponse(responseCode = "404", description = "Trip or user not found")
        }
    )
    @PostMapping("/{tripId}/participants/{userId}")
    public ResponseEntity<?> addParticipant(
            @PathVariable Long tripId,
            @PathVariable Long userId) {
        boolean success = tripService.addParticipant(tripId, userId);
        if (success) {
            return ResponseEntity.ok("Participant added successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Trip or user not found");
    }

    /**
     * Removes a participant from a trip.
     * @param tripId the trip ID
     * @param userId the user ID to remove
     * @return success message
     */
    @Operation(summary = "Remove a participant from a trip", description = "Removes a user from the specified trip's participants.",
        parameters = {
            @Parameter(name = "tripId", description = "Trip ID", example = "1"),
            @Parameter(name = "userId", description = "User ID to remove", example = "2")
        },
        responses = {
            @ApiResponse(responseCode = "200", description = "Participant removed successfully"),
            @ApiResponse(responseCode = "404", description = "Trip or user not found")
        }
    )
    @DeleteMapping("/{tripId}/participants/{userId}")
    public ResponseEntity<?> removeParticipant(
            @PathVariable Long tripId,
            @PathVariable Long userId) {
        boolean success = tripService.removeParticipant(tripId, userId);
        if (success) {
            return ResponseEntity.ok("Participant removed successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Trip or user not found");
    }

    @Operation(summary = "Update a trip", description = "Updates the details of an existing trip.",
        parameters = @Parameter(name = "id", description = "Trip ID", example = "1"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated trip data",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"title\": \"Updated Trip\", \"description\": \"Updated description\", \"startDate\": \"2024-08-01\", \"endDate\": \"2024-08-10\", \"destination\": \"London\", \"organizerId\": 1}"))
        ),
        responses = {
            @ApiResponse(responseCode = "200", description = "Trip updated successfully"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
        }
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @Valid @RequestBody TripDto tripDto) {
        // Implementation of updateTrip method
        return null; // Placeholder return, actual implementation needed
    }

    /**
     * Gets all trips.
     * @return list of all trips
     */
    @GetMapping
    public ResponseEntity<List<TripDto>> getAllTrips() {
        List<Trip> trips = tripService.findAll();
        List<TripDto> tripDtos = trips.stream().map(tripMapper::toDto).toList();
        return ResponseEntity.ok(tripDtos);
    }

    /**
     * Deletes a trip by its ID.
     * @param id the trip ID
     * @return 204 No Content if deleted, 404 Not Found otherwise
     */
    @Operation(summary = "Delete trip by ID", description = "Deletes a trip by its unique ID.",
        parameters = @Parameter(name = "id", description = "Trip ID to delete", example = "1"),
        responses = {
            @ApiResponse(responseCode = "204", description = "Trip deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
        }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id) {
        Optional<Trip> tripOpt = tripService.findById(id);
        if (tripOpt.isPresent()) {
            tripService.deleteTrip(tripOpt.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found");
        }
    }
} 
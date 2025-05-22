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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @Valid @RequestBody TripDto tripDto) {
        // Implementation of updateTrip method
        return null; // Placeholder return, actual implementation needed
    }
} 
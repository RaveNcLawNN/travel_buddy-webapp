package com.travelbuddy.travelbuddy.service;

import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.repository.TripRepository;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for trip-related business logic.
 * Handles trip creation, updates, and queries.
 */
@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new trip.
     * @param trip the trip to create
     * @return the saved trip
     */
    @Transactional
    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    /**
     * Updates an existing trip.
     * @param trip the trip to update
     * @return the updated trip
     */
    @Transactional
    public Trip updateTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    /**
     * Finds a trip by its ID.
     * @param id the trip ID
     * @return an Optional containing the found trip, or empty if not found
     */
    public Optional<Trip> findById(Long id) {
        return tripRepository.findById(id);
    }

    /**
     * Finds all trips organized by a specific user.
     * @param organizerId the ID of the organizer
     * @return list of trips organized by the user
     */
    public List<Trip> findByOrganizer(Long organizerId) {
        return userRepository.findById(organizerId)
                .map(tripRepository::findByOrganizer)
                .orElse(List.of());
    }

    /**
     * Finds all trips where a user is a participant.
     * @param userId the ID of the user
     * @return list of trips where the user is a participant
     */
    public List<Trip> findByParticipant(Long userId) {
        return userRepository.findById(userId)
                .map(tripRepository::findByParticipant)
                .orElse(List.of());
    }

    /**
     * Finds trips by their status.
     * @param status the trip status
     * @return list of trips with the specified status
     */
    public List<Trip> findByStatus(TripStatus status) {
        return tripRepository.findByStatus(status);
    }

    /**
     * Finds trips that are happening between two dates.
     * @param startDate the start date
     * @param endDate the end date
     * @return list of trips happening between the dates
     */
    public List<Trip> findTripsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return tripRepository.findTripsBetweenDates(startDate, endDate);
    }

    /**
     * Finds trips by destination.
     * @param destination the destination to search for
     * @return list of trips matching the destination
     */
    public List<Trip> findByDestination(String destination) {
        return tripRepository.findByDestinationContainingIgnoreCase(destination);
    }

    /**
     * Adds a participant to a trip.
     * @param tripId the trip ID
     * @param userId the user ID to add
     * @return true if successful, false if trip or user not found
     */
    @Transactional
    public boolean addParticipant(Long tripId, Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (tripOpt.isPresent() && userOpt.isPresent()) {
            Trip trip = tripOpt.get();
            User user = userOpt.get();
            trip.addParticipant(user);
            tripRepository.save(trip);
            return true;
        }
        return false;
    }

    /**
     * Removes a participant from a trip.
     * @param tripId the trip ID
     * @param userId the user ID to remove
     * @return true if successful, false if trip or user not found
     */
    @Transactional
    public boolean removeParticipant(Long tripId, Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (tripOpt.isPresent() && userOpt.isPresent()) {
            Trip trip = tripOpt.get();
            User user = userOpt.get();
            trip.removeParticipant(user);
            tripRepository.save(trip);
            return true;
        }
        return false;
    }

<<<<<<< HEAD
    public List<Trip> findAll() {
        return tripRepository.findAll();
=======
    @Transactional
    public void deleteTrip(Trip trip) {
        tripRepository.delete(trip);
>>>>>>> 5d602c6ed3cb3477dd3085ebf88f201ffa2821f2
    }
} 
package com.travelbuddy.travelbuddy.service;

import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.repository.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing location-related business logic.
 * 
 * This service acts as an intermediary between the LocationController and LocationRepository,
 * handling all location-related operations. It provides methods for saving and managing
 * locations in the database, ensuring proper transaction management.
 * 
 * The service is used by LocationController to persist locations associated with trips
 * and to manage location data throughout the application.
 */
@Service
public class LocationService {
    private final LocationRepository locationRepository;

    /**
     * Constructs a new LocationService with the required repository.
     * 
     * @param locationRepository The repository for database operations
     */
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    /**
     * Saves a location to the database.
     * This method is transactional, ensuring data consistency.
     * 
     * @param location The location entity to be saved
     * @return The saved location entity with generated ID
     */
    @Transactional
    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }
} 
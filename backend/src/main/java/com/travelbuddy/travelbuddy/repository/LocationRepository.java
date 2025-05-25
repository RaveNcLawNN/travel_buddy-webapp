package com.travelbuddy.travelbuddy.repository;

import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository interface for Location entities.
 * Provides CRUD operations and custom queries for Location objects.
 */
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    /**
     * Finds all locations associated with a specific trip.
     */
    List<Location> findByTrip(Trip trip);
    
    /**
     * Finds locations within a certain radius of given coordinates.
     * Uses the Haversine formula to calculate distances.
     */
    @Query(value = "SELECT * FROM locations WHERE " +
           "6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + " +
           "sin(radians(:lat)) * sin(radians(latitude))) < :radius", 
           nativeQuery = true)
    List<Location> findLocationsWithinRadius(
        @Param("lat") Double latitude,
        @Param("lon") Double longitude,
        @Param("radius") Double radiusInKm
    );
} 
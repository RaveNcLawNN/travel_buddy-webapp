package com.travelbuddy.travelbuddy.repository;

import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Trip entities.
 * Provides CRUD operations and custom queries for Trip objects.
 */
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    /**
     * Finds all trips organized by a specific user.
     */
    List<Trip> findByOrganizer(User organizer);
    
    /**
     * Finds all trips where a user is a participant.
     */
    @Query("SELECT t FROM Trip t JOIN t.participants p WHERE p = :user")
    List<Trip> findByParticipant(@Param("user") User user);
    
    /**
     * Finds trips by their status.
     */
    List<Trip> findByStatus(TripStatus status);
    
    /**
     * Finds trips that are happening between two dates.
     */
    @Query("SELECT t FROM Trip t WHERE t.startDate <= :endDate AND t.endDate >= :startDate")
    List<Trip> findTripsBetweenDates(@Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate);
    
    /**
     * Finds trips by destination (case-insensitive partial match).
     */
    List<Trip> findByDestinationContainingIgnoreCase(String destination);
} 
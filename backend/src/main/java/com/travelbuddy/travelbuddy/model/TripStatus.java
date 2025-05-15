package com.travelbuddy.travelbuddy.model;

/**
 * Represents the possible states of a trip in the TravelBuddy application.
 */
public enum TripStatus {
    PLANNING,    // Trip is in the planning phase
    CONFIRMED,   // Trip is confirmed and ready to go
    ONGOING,     // Trip is currently happening
    COMPLETED,   // Trip has been completed
    CANCELLED    // Trip has been cancelled
} 
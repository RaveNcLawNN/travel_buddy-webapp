package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.dto.LocationDto;
import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.service.GeocodingService;
import com.travelbuddy.travelbuddy.service.OverpassService;
import com.travelbuddy.travelbuddy.service.TripService;
import com.travelbuddy.travelbuddy.mapper.LocationMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for location-related operations.
 * Handles HTTP requests for location search and points of interest.
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final GeocodingService geocodingService;
    private final OverpassService overpassService;
    private final TripService tripService;
    private final LocationMapper locationMapper;

    public LocationController(
            GeocodingService geocodingService,
            OverpassService overpassService,
            TripService tripService,
            LocationMapper locationMapper) {
        this.geocodingService = geocodingService;
        this.overpassService = overpassService;
        this.tripService = tripService;
        this.locationMapper = locationMapper;
    }

    /**
     * Search for locations by name using Nominatim API.
     * @param query The location name to search for
     * @return List of location information
     */
    @GetMapping("/search")
    public ResponseEntity<List<GeocodingService.LocationInfo>> searchLocation(
            @RequestParam String query) {
        return ResponseEntity.ok(geocodingService.searchLocation(query));
    }

    /**
     * Search for points of interest near a location.
     * @param latitude Center point latitude
     * @param longitude Center point longitude
     * @param radius Search radius in meters (default: 1000)
     * @param types Comma-separated list of amenity types to search for
     * @return List of points of interest
     */
    @GetMapping("/poi")
    public ResponseEntity<List<OverpassService.PointOfInterest>> searchPointsOfInterest(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "1000") int radius,
            @RequestParam(defaultValue = "restaurant,cafe,hotel") String types) {
        
        List<String> amenityTypes = List.of(types.split(","));
        return ResponseEntity.ok(overpassService.searchPointsOfInterest(
            latitude, longitude, radius, amenityTypes));
    }

    /**
     * Add a location to a trip.
     * @param tripId The ID of the trip
     * @param locationDto The location information
     * @return The created location
     */
    @PostMapping("/trips/{tripId}")
    public ResponseEntity<?> addLocationToTrip(
            @PathVariable Long tripId,
            @RequestBody LocationDto locationDto) {
        
        return tripService.findById(tripId)
            .map(trip -> {
                Location location = locationMapper.toEntity(locationDto);
                location.setTrip(trip);
                // TODO: Save location using LocationService
                return ResponseEntity.ok(locationMapper.toDto(location));
            })
            .orElse(ResponseEntity.notFound().build());
    }
} 
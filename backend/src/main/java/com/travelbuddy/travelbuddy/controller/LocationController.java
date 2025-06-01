package com.travelbuddy.travelbuddy.controller;

import com.travelbuddy.travelbuddy.dto.LocationDto;
import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.service.GeocodingService;
import com.travelbuddy.travelbuddy.service.OverpassService;
import com.travelbuddy.travelbuddy.service.TripService;
import com.travelbuddy.travelbuddy.service.LocationService;
import com.travelbuddy.travelbuddy.mapper.LocationMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for handling location-related HTTP requests.
 * 
 * This controller provides endpoints for:
 * - Searching locations using OpenStreetMap's Nominatim API
 * - Finding points of interest using Overpass API
 * - Managing locations associated with trips
 * 
 * It coordinates between various services (GeocodingService, OverpassService, 
 * LocationService, TripService) to provide location-based functionality.
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final GeocodingService geocodingService;
    private final OverpassService overpassService;
    private final TripService tripService;
    private final LocationMapper locationMapper;
    private final LocationService locationService;

    /**
     * Constructs a new LocationController with all required dependencies.
     * 
     * @param geocodingService Service for geocoding operations
     * @param overpassService Service for finding points of interest
     * @param tripService Service for trip-related operations
     * @param locationMapper Mapper for converting between DTOs and entities
     * @param locationService Service for location-related operations
     */
    public LocationController(
            GeocodingService geocodingService,
            OverpassService overpassService,
            TripService tripService,
            LocationMapper locationMapper,
            LocationService locationService) {
        this.geocodingService = geocodingService;
        this.overpassService = overpassService;
        this.tripService = tripService;
        this.locationMapper = locationMapper;
        this.locationService = locationService;
    }

    /**
     * Search for locations by name using Nominatim API.
     * This endpoint is used by the frontend to find locations for the map.
     * 
     * @param query The location name to search for
     * @return List of location information including coordinates
     */
    @GetMapping("/search")
    public ResponseEntity<List<GeocodingService.LocationInfo>> searchLocation(
            @RequestParam String query) {
        return ResponseEntity.ok(geocodingService.searchLocation(query));
    }

    /**
     * Search for points of interest near a location using Overpass API.
     * This endpoint is used to find nearby amenities like restaurants, cafes, and hotels.
     * 
     * @param latitude Center point latitude
     * @param longitude Center point longitude
     * @param radius Search radius in meters (default: 1000)
     * @param types Comma-separated list of amenity types to search for
     * @return List of points of interest with their details
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
     * This endpoint allows users to save locations as part of their trips.
     * 
     * @param tripId The ID of the trip to add the location to
     * @param locationDto The location information to save
     * @return The created location with its ID
     */
    @PostMapping("/trips/{tripId}")
    public ResponseEntity<?> addLocationToTrip(
            @PathVariable Long tripId,
            @RequestBody LocationDto locationDto) {
        
        return tripService.findById(tripId)
            .map(trip -> {
                Location location = locationMapper.toEntity(locationDto);
                location.setTrip(trip);
                Location savedLocation = locationService.saveLocation(location);
                return ResponseEntity.ok(locationMapper.toDto(savedLocation));
            })
            .orElse(ResponseEntity.notFound().build());
    }
} 
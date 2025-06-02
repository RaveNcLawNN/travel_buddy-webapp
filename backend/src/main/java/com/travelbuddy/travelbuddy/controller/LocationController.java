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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

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
    @Operation(summary = "Search locations by name", description = "Search for locations using OpenStreetMap's Nominatim API.",
        parameters = @Parameter(name = "query", description = "Location name to search for", example = "Paris"),
        responses = @ApiResponse(responseCode = "200", description = "List of locations")
    )
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
    @Operation(summary = "Search points of interest", description = "Find points of interest near a location using Overpass API.",
        parameters = {
            @Parameter(name = "latitude", description = "Center latitude", example = "48.8584"),
            @Parameter(name = "longitude", description = "Center longitude", example = "2.2945"),
            @Parameter(name = "radius", description = "Search radius in meters", example = "1000"),
            @Parameter(name = "types", description = "Comma-separated amenity types", example = "restaurant,cafe,hotel")
        },
        responses = @ApiResponse(responseCode = "200", description = "List of points of interest")
    )
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
    @Operation(summary = "Add location to trip", description = "Add a new location to a specific trip.",
        parameters = @Parameter(name = "tripId", description = "Trip ID", example = "1"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Location data",
            required = true,
            content = @Content(examples = @ExampleObject(value = "{\"name\": \"Eiffel Tower\", \"latitude\": 48.8584, \"longitude\": 2.2945, \"address\": \"Champ de Mars, Paris\", \"type\": \"landmark\", \"description\": \"Iconic tower\"}"))
        ),
        responses = {
            @ApiResponse(responseCode = "200", description = "Location added successfully"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
        }
    )
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

    /**
     * Gets all locations for a specific trip.
     * @param tripId the trip ID
     * @return list of locations for the trip
     */
    @GetMapping("/trips/{tripId}")
    public ResponseEntity<List<LocationDto>> getLocationsByTrip(@PathVariable Long tripId) {
        var tripOpt = tripService.findById(tripId);
        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var locations = locationService.findByTrip(tripOpt.get());
        var dtos = locations.stream().map(locationMapper::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Updates a location by its ID.
     * @param id the location ID
     * @param locationDto the updated location data
     * @return the updated location
     */
    @PutMapping("/{id}")
    public ResponseEntity<LocationDto> updateLocation(@PathVariable Long id, @RequestBody LocationDto locationDto) {
        var locationOpt = locationService.findById(id);
        if (locationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var location = locationOpt.get();
        location.setName(locationDto.getName());
        location.setLatitude(locationDto.getLatitude());
        location.setLongitude(locationDto.getLongitude());
        location.setAddress(locationDto.getAddress());
        location.setType(locationDto.getType());
        location.setDescription(locationDto.getDescription());
        var updated = locationService.saveLocation(location);
        return ResponseEntity.ok(locationMapper.toDto(updated));
    }

    /**
     * Deletes a location by its ID.
     * @param id the location ID
     * @return 204 No Content if deleted, 404 Not Found otherwise
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        var locationOpt = locationService.findById(id);
        if (locationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        locationService.deleteLocation(locationOpt.get());
        return ResponseEntity.noContent().build();
    }
} 
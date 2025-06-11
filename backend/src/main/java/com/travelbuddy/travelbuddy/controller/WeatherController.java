package com.travelbuddy.travelbuddy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelbuddy.travelbuddy.dto.WeatherLocationDto;
import com.travelbuddy.travelbuddy.service.WeatherService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

/**
 * REST controller for weather-related operations.
 * 
 * This controller provides endpoints for retrieving weather data using the Open-Meteo API.
 * It handles requests for weather forecasts based on geographical coordinates.
 */
@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService)
    {
        this.weatherService = weatherService;
    }

    /**
     * Retrieves weather forecast data for a specific location using Open-Meteo API.
     * The forecast includes temperature, precipitation, wind speed, and other weather metrics.
     * 
     * @param latitude the latitude coordinate of the location
     * @param longitude the longitude coordinate of the location
     * @return WeatherLocationDto containing the forecast data
     */
    @Operation(summary = "Get weather forecast", description = "Retrieves weather forecast data for a specific location using Open-Meteo API. Returns temperature, precipitation, wind speed, and other weather metrics.",
        parameters = {
            @Parameter(name = "latitude", description = "Latitude coordinate of the location", example = "48.2"),
            @Parameter(name = "longitude", description = "Longitude coordinate of the location", example = "16.38")
        },
        responses = {
            @ApiResponse(responseCode = "200", description = "Weather forecast data retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid coordinates provided"),
            @ApiResponse(responseCode = "500", description = "Error retrieving weather data from Open-Meteo API")
        }
    )
    @GetMapping("/forecast")
    public ResponseEntity<WeatherLocationDto> WeatherLocationData(
        @RequestParam double latitude,
        @RequestParam double longitude) {
            return ResponseEntity.ok(weatherService.getWeatherData(latitude, longitude));
        }


}

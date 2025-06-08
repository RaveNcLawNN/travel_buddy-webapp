package com.travelbuddy.travelbuddy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelbuddy.travelbuddy.dto.WeatherLocationDto;
import com.travelbuddy.travelbuddy.service.WeatherService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService)
    {
        this.weatherService = weatherService;
    }

    @Operation(summary = "Get weather Data", description = "Gets weather data for a specific location per open-meteo API.",
        parameters = {
            @Parameter(name = "latitude", description = "Latitude of the Location", example = "48.2"),
            @Parameter(name = "longitude", description = "longitude of the Location", example = "16.38")
        },
        responses = @ApiResponse(responseCode = "200", description = "Weather Data Dto.")
    )
    @GetMapping("/forecast")
    public ResponseEntity<WeatherLocationDto> WeatherLocationData(
        @RequestParam double latitude,
        @RequestParam double longitude) {
            return ResponseEntity.ok(weatherService.getWeatherData(latitude, longitude));
        }


}

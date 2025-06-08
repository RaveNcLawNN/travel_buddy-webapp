package com.travelbuddy.travelbuddy.dto;

import java.util.ArrayList;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for weather information.
 * Used for transferring weather data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherLocationDto {

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "")
    private long timezoneOffset;

    @NotNull(message = "")
    private long currentTime;

    @NotNull(message = "")
    private WeatherDaily[] dailyWeatherData;

    @NotNull(message = "")
    private WeatherHourly[] hourlyWeatherData;
} 
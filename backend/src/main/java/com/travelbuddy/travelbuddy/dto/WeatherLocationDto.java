package com.travelbuddy.travelbuddy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

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
    private double elevation;

    @NotNull(message = "")
    private WeatherCurrentDto currentWeather;

    @NotNull(message = "")
    private List<WeatherDailyDto> dailyWeatherData;

    @NotNull(message = "")
    private List<WeatherHourlyDto> hourlyWeatherData;
} 
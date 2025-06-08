package com.travelbuddy.travelbuddy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Storage Object for daily weather information.
 * Used for transferring weather data between client and server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherDailyDto {

    @NotNull(message = "")
    private String time;

    @NotNull(message = "")
    private String weather_code;

    @NotNull(message = "")
    private double tempMin;

    @NotNull(message = "")
    private double tempMax;

    @NotNull(message = "")
    private String sunrise;

    @NotNull(message = "")
    private String sunset;

    @NotNull(message = "")
    private int rain_sum;

    @NotNull(message = "")
    private int snowfall_sum;

    @NotNull(message = "")
    private int precipitation_probability;
} 
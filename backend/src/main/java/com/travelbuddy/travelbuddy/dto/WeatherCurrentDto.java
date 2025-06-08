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
public class WeatherCurrentDto {

    @NotNull(message = "")
    private String time;

    @NotNull(message = "")
    private String weather_code;

    @NotNull(message = "")
    private double temperature;

    @NotNull(message = "")
    private double apparentTemperature;

    @NotNull(message = "")
    private int humidity;

    @NotNull(message = "")
    private int precipitation;
}
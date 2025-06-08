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
@Builder
public class WeatherDaily {
} 
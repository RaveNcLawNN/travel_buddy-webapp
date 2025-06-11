package com.travelbuddy.travelbuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelbuddy.travelbuddy.dto.WeatherCurrentDto;
import com.travelbuddy.travelbuddy.dto.WeatherDailyDto;
import com.travelbuddy.travelbuddy.dto.WeatherHourlyDto;
import com.travelbuddy.travelbuddy.dto.WeatherLocationDto;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.time.format.DateTimeFormatter;

/**
 * Service for retrieving weather data using the Open-Meteo API.
 * 
 * This service provides functionality to fetch current weather conditions,
 * hourly forecasts, and daily forecasts for any location using its coordinates.
 * It handles the communication with the Open-Meteo API and processes the response
 * into structured DTOs for easy consumption by the application.
 */
@Service
public class WeatherService {
    private static final String API_URL = "https://api.open-meteo.com/v1/forecast?timezone=auto";
    private static final String DAILY_URL = "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum,precipitation_probability_mean";
    private static final String HOURLY_URL = "&hourly=temperature_2m,relative_humidity_2m,cloud_cover,weather_code,apparent_temperature,wind_speed_10m,precipitation_probability";
    private static final String CURRENT_URL = "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code";
    private static final String URL_BASE = API_URL + DAILY_URL + HOURLY_URL + CURRENT_URL;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    DateTimeFormatter formatedTime = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    public WeatherService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Retrieves comprehensive weather data for a specific location.
     * 
     * This method fetches current weather conditions, hourly forecasts for the next 24 hours,
     * and daily forecasts for the next 7 days. The data includes temperature, humidity,
     * precipitation, wind speed, and other meteorological parameters.
     * 
     * @param lati the latitude coordinate of the location
     * @param longi the longitude coordinate of the location
     * @return WeatherLocationDto containing current conditions, hourly and daily forecasts
     * @throws RuntimeException if there's an error parsing the Open-Meteo API response
     */
    public WeatherLocationDto getWeatherData(double lati, double longi)
    {
        String url = UriComponentsBuilder.fromUriString(URL_BASE)
                .queryParam("latitude", lati)
                .queryParam("longitude", longi)
                .build()
                .toUriString();
        
        String response = webClient.get()
                .uri(url)
                .header("User-Agent", "TravelBuddy/1.0")
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        JsonNode currentNode = root.get("current");
                        JsonNode hourlyNode = root.get("hourly");
                        JsonNode dailyNode = root.get("daily");

                        List<WeatherHourlyDto> hourlyData = new ArrayList<>();
                        List<WeatherDailyDto> dailyData = new ArrayList<>();
                        

                        WeatherCurrentDto current = new WeatherCurrentDto(
                            currentNode.get("time").asText(),
                        currentNode.get("weather_code").asText(),
                        currentNode.get("temperature_2m").asDouble(),
                        currentNode.get("apparent_temperature").asDouble(),
                        currentNode.get("relative_humidity_2m").asInt(),
                        currentNode.get("precipitation").asInt());


                        JsonNode hourlyTime = hourlyNode.get("time");
                        JsonNode hourlyTemp = hourlyNode.get("temperature_2m");
                        JsonNode hourlyTempApp = hourlyNode.get("apparent_temperature");
                        JsonNode hourlyHumidity = hourlyNode.get("relative_humidity_2m");
                        JsonNode hourlyCloudCover = hourlyNode.get("cloud_cover");
                        JsonNode hourlyWeatherCode = hourlyNode.get("weather_code");
                        JsonNode hourlyWindSpeed = hourlyNode.get("wind_speed_10m");
                        JsonNode hourlyPrecipitationprob = hourlyNode.get("precipitation_probability");

                        for(int i=0; i < hourlyTime.size(); i++)
                        {
                            WeatherHourlyDto hourly = new WeatherHourlyDto(
                                hourlyTime.get(i).asText(), 
                                hourlyTemp.get(i).asDouble(), 
                                hourlyTempApp.get(i).asDouble(), 
                                hourlyHumidity.get(i).asInt(),
                                hourlyCloudCover.get(i).asInt(),
                                hourlyWeatherCode.get(i).asText(),
                                hourlyWindSpeed.get(i).asDouble(),
                                hourlyPrecipitationprob.get(i).asInt());
                            hourlyData.add(hourly);
                        }


                        JsonNode dailyTime = dailyNode.get("time");
                        JsonNode dailyWeatherCode = dailyNode.get("weather_code");
                        JsonNode dailyTempMin = dailyNode.get("temperature_2m_min");
                        JsonNode dailyTempMax = dailyNode.get("temperature_2m_max");
                        JsonNode dailySunrise = dailyNode.get("sunrise");
                        JsonNode dailySunset = dailyNode.get("sunset");
                        JsonNode dailyRainSum = dailyNode.get("rain_sum");
                        JsonNode dailySnowSum = dailyNode.get("snowfall_sum");
                        JsonNode dailyPrecipitationprob = dailyNode.get("precipitation_probability_mean");

                        for(int i=0; i < dailyTime.size(); i++)
                        {
                            WeatherDailyDto daily = new WeatherDailyDto(
                                dailyTime.get(i).asText(),
                                dailyWeatherCode.get(i).asText(),
                                dailyTempMin.get(i).asDouble(),
                                dailyTempMax.get(i).asDouble(),
                                dailySunrise.get(i).asText(),
                                dailySunset.get(i).asText(),
                                dailyRainSum.get(i).asInt(),
                                dailySnowSum.get(i).asInt(),
                                dailyPrecipitationprob.get(i).asInt());
                            dailyData.add(daily);
                        }


                        WeatherLocationDto weatherLocation = new WeatherLocationDto(
                            root.get("latitude").asDouble(), 
                            root.get("longitude").asDouble(), 
                            root.get("utc_offset_seconds").asLong(),
                            root.get("elevation").asDouble(),
                            current,
                            dailyData,
                            hourlyData);




                        return weatherLocation;
                    } catch (Exception e) {
                        throw new RuntimeException("Error parsing open-meteo API response", e);
                    }
                }
    }

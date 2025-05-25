package com.travelbuddy.travelbuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for geocoding operations using OpenStreetMap's Nominatim API.
 */
@Service
public class GeocodingService {
    private static final String NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeocodingService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Search for locations by name using Nominatim API.
     * @param query The location name to search for
     * @return List of location information including coordinates
     */
    public List<LocationInfo> searchLocation(String query) {
        String url = UriComponentsBuilder.fromUriString(NOMINATIM_API_URL)
                .queryParam("q", query)
                .queryParam("format", "json")
                .queryParam("limit", 10)
                .build()
                .toUriString();

        return webClient.get()
                .uri(url)
                .header("User-Agent", "TravelBuddy/1.0")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        List<LocationInfo> locations = new ArrayList<>();
                        root.forEach(node -> {
                            LocationInfo location = new LocationInfo(
                                node.get("display_name").asText(),
                                node.get("lat").asDouble(),
                                node.get("lon").asDouble(),
                                node.get("type").asText()
                            );
                            locations.add(location);
                        });
                        return locations;
                    } catch (Exception e) {
                        throw new RuntimeException("Error parsing Nominatim response", e);
                    }
                })
                .block();
    }

    /**
     * Inner class to represent location information from Nominatim API.
     */
    public static class LocationInfo {
        private final String displayName;
        private final double latitude;
        private final double longitude;
        private final String type;

        public LocationInfo(String displayName, double latitude, double longitude, String type) {
            this.displayName = displayName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.type = type;
        }

        public String getDisplayName() { return displayName; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getType() { return type; }
    }
} 
package com.travelbuddy.travelbuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for querying points of interest using Overpass API.
 */
@Service
public class OverpassService {
    private static final String OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OverpassService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Search for points of interest within a radius of given coordinates.
     * @param latitude Center point latitude
     * @param longitude Center point longitude
     * @param radiusInMeters Search radius in meters
     * @param amenityTypes List of amenity types to search for (e.g., "restaurant", "cafe", "hotel")
     * @return List of points of interest
     */
    public List<PointOfInterest> searchPointsOfInterest(
            double latitude,
            double longitude,
            int radiusInMeters,
            List<String> amenityTypes) {
        
        StringBuilder query = new StringBuilder();
        query.append("[out:json][timeout:25];(");
        
        for (String amenity : amenityTypes) {
            query.append(String.format(
                "node[\"amenity\"=\"%s\"](around:%d,%f,%f);",
                amenity, radiusInMeters, latitude, longitude
            ));
        }
        
        query.append(");out body;>;out skel qt;");

        return webClient.post()
                .uri(OVERPASS_API_URL)
                .bodyValue(query.toString())
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        List<PointOfInterest> pois = new ArrayList<>();
                        
                        root.get("elements").forEach(node -> {
                            if (node.has("tags")) {
                                JsonNode tags = node.get("tags");
                                PointOfInterest poi = new PointOfInterest(
                                    tags.get("name").asText("Unnamed"),
                                    node.get("lat").asDouble(),
                                    node.get("lon").asDouble(),
                                    tags.get("amenity").asText(),
                                    tags.get("website").asText(null),
                                    tags.get("phone").asText(null)
                                );
                                pois.add(poi);
                            }
                        });
                        
                        return pois;
                    } catch (Exception e) {
                        throw new RuntimeException("Error parsing Overpass response", e);
                    }
                })
                .block();
    }

    /**
     * Inner class to represent a point of interest from Overpass API.
     */
    public static class PointOfInterest {
        private final String name;
        private final double latitude;
        private final double longitude;
        private final String type;
        private final String website;
        private final String phone;

        public PointOfInterest(String name, double latitude, double longitude, 
                             String type, String website, String phone) {
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.type = type;
            this.website = website;
            this.phone = phone;
        }

        public String getName() { return name; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getType() { return type; }
        public String getWebsite() { return website; }
        public String getPhone() { return phone; }
    }
} 
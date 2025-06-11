package com.travelbuddy.travelbuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;

/**
 * Service for querying points of interest using Overpass API.
 * 
 * This service provides functionality to search for various points of interest (POIs) 
 * around a given location using the Overpass API. It supports searching for different 
 * types of amenities like restaurants, cafes, hotels, and tourist attractions.
 * 
 * The service maps common amenity types to their corresponding OpenStreetMap tags
 * and constructs appropriate Overpass QL queries to fetch the data.
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
     * 
     * This method constructs an Overpass QL query to find various types of amenities
     * within the specified radius. The query is built dynamically based on the requested
     * amenity types, which are mapped to their corresponding OpenStreetMap tags.
     * 
     * @param latitude       Center point latitude
     * @param longitude      Center point longitude
     * @param radiusInMeters Search radius in meters
     * @param amenityTypes   List of amenity types to search for (e.g., "restaurant", "cafe", "hotel")
     * @return List of points of interest with their details (name, coordinates, type, website, phone)
     * @throws RuntimeException if there's an error parsing the Overpass API response
     */
    public List<PointOfInterest> searchPointsOfInterest(
            double latitude,
            double longitude,
            int radiusInMeters,
            List<String> amenityTypes) {

        StringBuilder query = new StringBuilder();
        // Map amenity types to their correct Overpass tags
        Map<String, String[]> typeToTag = new HashMap<>() {
            {
                put("restaurant", new String[] { "amenity", "restaurant" });
                put("cafe", new String[] { "amenity", "cafe" });
                put("theatre", new String[] { "amenity", "theatre" });
                put("bar", new String[] { "amenity", "bar" });
                put("pub", new String[] { "amenity", "pub" });
                put("parking", new String[] { "amenity", "parking" });

                put("hotel", new String[] { "tourism", "hotel" });
                put("museum", new String[] { "tourism", "museum" });
                put("attraction", new String[] { "tourism", "attraction" });
                put("viewpoint", new String[] { "tourism", "viewpoint" });
                put("hostel", new String[] { "tourism", "hostel" });
                put("information", new String[] { "tourism", "information" });

                put("park", new String[] { "leisure", "park" });
                put("playground", new String[] { "leisure", "playground" });

                put("monument", new String[] { "historic", "monument" });
                put("castle", new String[] { "historic", "castle" });
                put("memorial", new String[] { "historic", "memorial" });
                put("ruins", new String[] { "historic", "ruins" });
            }
        };

        query.append("[out:json][timeout:25];(");
        for (String amenity : amenityTypes) {
            String[] tag = typeToTag.get(amenity);
            if (tag != null) {
                query.append(String.format(Locale.US,
                        "node[\"%s\"=\"%s\"](around:%d,%f,%f);",
                        tag[0], tag[1], radiusInMeters, latitude, longitude));
            }
        }
        query.append(");out body;>;out skel qt;");

        System.out.println("Overpass QL query:\n" + query);
        return webClient.post()
                .uri(OVERPASS_API_URL)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body(BodyInserters.fromFormData("data", query.toString()))
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        List<PointOfInterest> pois = new ArrayList<>();

                        root.get("elements").forEach(node -> {
                            if (node.has("tags")) {
                                JsonNode tags = node.get("tags");
                                String name = tags.has("name") ? tags.get("name").asText("Unnamed") : "Unnamed";
                                String type = tags.has("amenity") ? tags.get("amenity").asText("")
                                        : tags.has("tourism") ? tags.get("tourism").asText("") : "";
                                type = capitalize(type);
                                String website = tags.has("website") ? tags.get("website").asText(null) : null;
                                String phone = tags.has("phone") ? tags.get("phone").asText(null) : null;
                                PointOfInterest poi = new PointOfInterest(
                                        name,
                                        node.get("lat").asDouble(),
                                        node.get("lon").asDouble(),
                                        type,
                                        website,
                                        phone);
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
     * Capitalizes the first letter of a string.
     * Used for formatting amenity types in a consistent way.
     * 
     * @param s the string to capitalize
     * @return the capitalized string, or the original string if null or empty
     */
    private static String capitalize(String s) {
        if (s == null || s.isEmpty())
            return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    /**
     * Inner class representing a point of interest from the Overpass API.
     * Contains all relevant information about a location including its name,
     * coordinates, type, and contact information.
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

        public String getName() {
            return name;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public String getType() {
            return type;
        }

        public String getWebsite() {
            return website;
        }

        public String getPhone() {
            return phone;
        }
    }
}
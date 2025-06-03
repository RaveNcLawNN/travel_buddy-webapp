package com.travelbuddy.travelbuddy.config;

import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import com.travelbuddy.travelbuddy.repository.TripRepository;
import com.travelbuddy.travelbuddy.repository.LocationRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

/**
 * Configuration class for initializing test data in the H2 database.
 * This is only active during development and testing.
 */
@Configuration
public class DataInitializer {


        
    /**
     * Creates a CommandLineRunner that populates the database with test data.
     * This data is useful for development and testing purposes.
     */
    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            TripRepository tripRepository,
            LocationRepository locationRepository,
            PasswordEncoder passwordEncoder) {
        
        //
        return _ -> {
            // Create test users
            User user1 = User.builder()
                    .username("john_doe")
                    .email("john@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .build();
            
            User user2 = User.builder()
                    .username("jane_smith")
                    .email("jane@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .build();
            
            userRepository.save(user1);
            userRepository.save(user2);

            // Create test trips
            Trip trip1 = Trip.builder()
                    .title("Summer Vacation")
                    .description("A wonderful summer trip to Paris")
                    .startDate(LocalDate.of(2024, 7, 1))
                    .endDate(LocalDate.of(2024, 7, 7))
                    .destination("Paris")
                    .latitude(48.8566)
                    .longitude(2.3522)
                    .organizer(user1)
                    .status(TripStatus.PLANNING)
                    .build();
            
            trip1.addParticipant(user1);
            trip1.addParticipant(user2);
            tripRepository.save(trip1);

            // Create test locations
            Location eiffelTower = Location.builder()
                    .name("Eiffel Tower")
                    .latitude(48.8584)
                    .longitude(2.2945)
                    .address("Champ de Mars, 5 Avenue Anatole France, 75007 Paris")
                    .type("landmark")
                    .description("Iconic iron lattice tower on the Champ de Mars")
                    .trip(trip1)
                    .build();
            
            Location louvre = Location.builder()
                    .name("Louvre Museum")
                    .latitude(48.8606)
                    .longitude(2.3376)
                    .address("Rue de Rivoli, 75001 Paris")
                    .type("museum")
                    .description("World's largest art museum")
                    .trip(trip1)
                    .build();
            
            locationRepository.save(eiffelTower);
            locationRepository.save(louvre);
        };
    }
} 
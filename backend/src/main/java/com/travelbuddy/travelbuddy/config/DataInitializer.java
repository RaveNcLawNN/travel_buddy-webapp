package com.travelbuddy.travelbuddy.config;

import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import com.travelbuddy.travelbuddy.repository.TripRepository;
import com.travelbuddy.travelbuddy.repository.LocationRepository;
import com.travelbuddy.travelbuddy.repository.BuddyRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
            BuddyRepository buddyRepository,
            PasswordEncoder passwordEncoder) {
        
        return _ -> {
            System.out.println("Initializing test data...");
            
            // Create test users (team members)
            User david = User.builder()
                    .username("david")
                    .email("david@example.com")
                    .password(passwordEncoder.encode("123"))
                    .build();
            
            User emanuel = User.builder()
                    .username("emanuel")
                    .email("emanuel@example.com")
                    .password(passwordEncoder.encode("123"))
                    .build();
            
            User martin = User.builder()
                    .username("martin")
                    .email("martin@example.com")
                    .password(passwordEncoder.encode("123"))
                    .build();
            
            User daniel = User.builder()
                    .username("daniel")
                    .email("daniel@example.com")
                    .password(passwordEncoder.encode("123"))
                    .build();
            
            userRepository.save(david);
            userRepository.save(emanuel);
            userRepository.save(martin);
            userRepository.save(daniel);

            System.out.println("Test users created:");
            System.out.println("David: " + david.getUsername() + " - " + david.getPassword());
            System.out.println("Emanuel: " + emanuel.getUsername() + " - " + emanuel.getPassword());
            System.out.println("Martin: " + martin.getUsername() + " - " + martin.getPassword());
            System.out.println("Daniel: " + daniel.getUsername() + " - " + daniel.getPassword());

            // Create test trips
            Trip trip1 = Trip.builder()
                    .title("Summer Vacation")
                    .description("A wonderful summer trip to Paris")
                    .startDate(LocalDate.of(2024, 7, 1))
                    .endDate(LocalDate.of(2024, 7, 7))
                    .destination("Paris")
                    .latitude(48.8566)
                    .longitude(2.3522)
                    .organizer(david)
                    .status(TripStatus.PLANNING)
                    .build();
            
            trip1.addParticipant(david);
            trip1.addParticipant(emanuel);
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

            // Create some test buddy relationships
            Buddy buddy1 = Buddy.builder()
                    .user(david)
                    .buddy(emanuel)
                    .accepted(true)
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .acceptedAt(LocalDateTime.now().minusDays(4))
                    .build();

            Buddy buddy2 = Buddy.builder()
                    .user(martin)
                    .buddy(daniel)
                    .accepted(true)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .acceptedAt(LocalDateTime.now().minusDays(2))
                    .build();

            Buddy buddy3 = Buddy.builder()
                    .user(david)
                    .buddy(martin)
                    .accepted(false)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();

            buddyRepository.save(buddy1);
            buddyRepository.save(buddy2);
            buddyRepository.save(buddy3);
        };
    }
} 
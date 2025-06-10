package com.travelbuddy.travelbuddy.config;

import com.travelbuddy.travelbuddy.model.User;
import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.Location;
import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.model.TripStatus;
import com.travelbuddy.travelbuddy.repository.UserRepository;
import com.travelbuddy.travelbuddy.repository.TripRepository;
import com.travelbuddy.travelbuddy.repository.LocationRepository;
import com.travelbuddy.travelbuddy.repository.BuddyRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;


/**
 * Configuration class for initializing test data in the H2 database.
 * This is only active during development and testing.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private BuddyRepository buddyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        System.out.println("Initializing test data...");
        
        // Ensure admin user exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                .username("admin")
                .email("admin@example.com")
                .password(passwordEncoder.encode("123"))
                .role("ADMIN")
                .build();
            userRepository.save(admin);
        }
        
        // Create test users if they don't exist
        createUserIfNotExists("david@example.com", "david", "123");
        createUserIfNotExists("emanuel@example.com", "emanuel", "123");
        createUserIfNotExists("martin@example.com", "martin", "123");
        createUserIfNotExists("daniel@example.com", "daniel", "123");
        
        // Get the users
        User david = userRepository.findByEmail("david@example.com")
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        User emanuel = userRepository.findByEmail("emanuel@example.com")
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        User martin = userRepository.findByEmail("martin@example.com")
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        User daniel = userRepository.findByEmail("daniel@example.com")
            .orElseThrow(() -> new RuntimeException("Test user not found"));

        // Create test trip if it doesn't exist
        if (!tripRepository.existsByTitleAndOrganizer("Summer Vacation", david)) {
            Trip trip = Trip.builder()
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
            
            trip.addParticipant(david);
            trip.addParticipant(emanuel);
            trip.addParticipant(martin);
            trip.addParticipant(daniel);
            tripRepository.save(trip);

            // Create test locations if they don't exist
            if (!locationRepository.existsByNameAndTrip("Eiffel Tower", trip)) {
                Location eiffelTower = Location.builder()
                    .name("Eiffel Tower")
                    .latitude(48.8584)
                    .longitude(2.2945)
                    .address("Champ de Mars, 5 Avenue Anatole France, 75007 Paris")
                    .type("landmark")
                    .description("Iconic iron lattice tower on the Champ de Mars")
                    .trip(trip)
                    .build();
                locationRepository.save(eiffelTower);
            }

            if (!locationRepository.existsByNameAndTrip("Louvre Museum", trip)) {
                Location louvre = Location.builder()
                    .name("Louvre Museum")
                    .latitude(48.8606)
                    .longitude(2.3376)
                    .address("Rue de Rivoli, 75001 Paris")
                    .type("museum")
                    .description("World's largest art museum")
                    .trip(trip)
                    .build();
                locationRepository.save(louvre);
            }
        }

        // Create buddy relationships if they don't exist
        createBuddyIfNotExists(david, emanuel);
        createBuddyIfNotExists(david, martin);
        createBuddyIfNotExists(david, daniel);
        createBuddyIfNotExists(emanuel, martin);
        createBuddyIfNotExists(emanuel, daniel);
        createBuddyIfNotExists(martin, daniel);
    }

    private void createUserIfNotExists(String email, String username, String password) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .build();
            userRepository.save(user);
        }
    }

    private void createBuddyIfNotExists(User user, User buddy) {
        if (!buddyRepository.existsByUserAndBuddy(user, buddy)) {
            Buddy buddyRelation = Buddy.builder()
                .user(user)
                .buddy(buddy)
                .accepted(true)
                .createdAt(LocalDateTime.now().minusDays(5))
                .acceptedAt(LocalDateTime.now().minusDays(4))
                .build();
            buddyRepository.save(buddyRelation);
        }
    }
} 
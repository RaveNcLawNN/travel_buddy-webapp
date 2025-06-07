package com.travelbuddy.travelbuddy.repository;

import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuddyRepository extends JpaRepository<Buddy, Long> {
    
    @Query("SELECT b FROM Buddy b WHERE (b.user = :user AND b.buddy = :buddy) OR (b.user = :buddy AND b.buddy = :user)")
    Optional<Buddy> findBuddyRelationship(@Param("user") User user, @Param("buddy") User buddy);
    
    @Query("SELECT b FROM Buddy b WHERE (b.user = :user OR b.buddy = :user) AND b.accepted = true")
    List<Buddy> findAllBuddies(@Param("user") User user);
    
    @Query("SELECT b FROM Buddy b WHERE b.buddy = :user AND b.accepted = false")
    List<Buddy> findPendingBuddyRequests(@Param("user") User user);
    
    @Query("SELECT b FROM Buddy b WHERE b.user = :user AND b.accepted = false")
    List<Buddy> findSentBuddyRequests(@Param("user") User user);

    boolean existsByUserAndBuddy(User user, User buddy);
} 
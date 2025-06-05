package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.BuddyDto;
import com.travelbuddy.travelbuddy.model.Buddy;
import com.travelbuddy.travelbuddy.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BuddyMapper {
    default BuddyDto toDto(Buddy buddy, User currentUser) {
        User other = buddy.getUser().equals(currentUser) ? buddy.getBuddy() : buddy.getUser();
        return BuddyDto.builder()
                .id(buddy.getId())
                .username(other.getUsername())
                .email(other.getEmail())
                .accepted(buddy.isAccepted())
                .createdAt(buddy.getCreatedAt())
                .acceptedAt(buddy.getAcceptedAt())
                .build();
    }
} 
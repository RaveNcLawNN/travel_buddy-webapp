package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.TripDto;
import com.travelbuddy.travelbuddy.model.Trip;
import com.travelbuddy.travelbuddy.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = LocationMapper.class)
public interface TripMapper {
    
    @Mapping(target = "organizerId", source = "organizer.id")
    @Mapping(target = "organizerUsername", source = "organizer.username")
    @Mapping(target = "latitude", source = "latitude")
    @Mapping(target = "longitude", source = "longitude")
    @Mapping(target = "locations", source = "locations")
    @Mapping(target = "participantUsernames", expression = "java(participantsToUsernames(trip.getParticipants()))")
    TripDto toDto(Trip trip);

    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "latitude", source = "latitude")
    @Mapping(target = "longitude", source = "longitude")
    @Mapping(target = "locations", source = "locations")
    Trip toEntity(TripDto tripDto);

    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "latitude", source = "latitude")
    @Mapping(target = "longitude", source = "longitude")
    @Mapping(target = "locations", ignore = true)
    void updateEntityFromDto(TripDto tripDto, @MappingTarget Trip trip);

    // Helper for mapping participants to usernames
    default List<String> participantsToUsernames(Set<User> participants) {
        return participants == null ? List.of() : participants.stream().map(User::getUsername).collect(Collectors.toList());
    }
} 
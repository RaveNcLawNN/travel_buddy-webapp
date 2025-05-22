package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.TripDto;
import com.travelbuddy.travelbuddy.model.Trip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TripMapper {
    
    @Mapping(target = "organizerId", source = "organizer.id")
    TripDto toDto(Trip trip);

    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    Trip toEntity(TripDto tripDto);

    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "participants", ignore = true)
    void updateEntityFromDto(TripDto tripDto, @MappingTarget Trip trip);
} 
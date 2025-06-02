package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.TripDto;
import com.travelbuddy.travelbuddy.model.Trip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = LocationMapper.class)
public interface TripMapper {
    
    @Mapping(target = "organizerId", source = "organizer.id")
    @Mapping(target = "latitude", source = "latitude")
    @Mapping(target = "longitude", source = "longitude")
    @Mapping(target = "locations", source = "locations")
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
    @Mapping(target = "locations", source = "locations")
    void updateEntityFromDto(TripDto tripDto, @MappingTarget Trip trip);
} 
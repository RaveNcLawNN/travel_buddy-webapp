package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.LocationDto;
import com.travelbuddy.travelbuddy.model.Location;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    
    @Mapping(target = "tripId", source = "trip.id")
    LocationDto toDto(Location location);

    @Mapping(target = "trip", ignore = true)
    Location toEntity(LocationDto locationDto);

    @Mapping(target = "trip", ignore = true)
    void updateEntityFromDto(LocationDto locationDto, @MappingTarget Location location);
} 
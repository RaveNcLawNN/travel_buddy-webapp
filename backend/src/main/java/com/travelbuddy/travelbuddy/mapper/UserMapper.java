package com.travelbuddy.travelbuddy.mapper;

import com.travelbuddy.travelbuddy.dto.UserDto;
import com.travelbuddy.travelbuddy.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "id", ignore = true)
    User toEntity(UserDto dto);
} 
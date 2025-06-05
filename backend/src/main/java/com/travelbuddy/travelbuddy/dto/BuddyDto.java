package com.travelbuddy.travelbuddy.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuddyDto {
    private Long id;
    private String username;
    private String email;
    private boolean accepted;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
} 
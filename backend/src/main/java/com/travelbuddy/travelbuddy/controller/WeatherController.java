package com.travelbuddy.travelbuddy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    public WeatherController()
    {

    }
/* 
    @GetMapping("/get")
    public ResponseEntity<?> WeatherLocationData(
        @RequestParam double latitude,
        @RequestParam double longitude) {
            return ResponseEntity.ok();
        }*/


}

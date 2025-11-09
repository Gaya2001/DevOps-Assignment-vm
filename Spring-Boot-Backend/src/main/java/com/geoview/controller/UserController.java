package com.geoview.controller;

import com.geoview.dto.AddFavoriteRequest;
import com.geoview.model.FavoriteCountry;
import com.geoview.model.User;
import com.geoview.repository.UserRepository;
import com.geoview.security.UserPrincipal;
import com.geoview.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            // Use cached service method
            Optional<User> userOptional = userService.getUserById(userPrincipal.getId());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(createErrorResponse("User not found"));
            }
            
            User user = userOptional.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("favoriteCountries", user.getFavoriteCountries());
            userInfo.put("createdAt", user.getCreatedAt());
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/favorites")
    public ResponseEntity<?> addFavoriteCountry(@Valid @RequestBody AddFavoriteRequest request,
                                              Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Optional<User> userOptional = userService.getUserById(userPrincipal.getId());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(createErrorResponse("User not found"));
            }
            
            User user = userOptional.get();
            
            // Check if country already exists in favorites
            boolean exists = user.getFavoriteCountries().stream()
                    .anyMatch(country -> country.getCountryCode().equals(request.getCountryCode()));
            
            if (exists) {
                return ResponseEntity.status(400).body(createErrorResponse("Country already in favorites"));
            }
            
            // Add country to favorites using service (will evict cache)
            FavoriteCountry favoriteCountry = new FavoriteCountry(
                    request.getCountryCode(),
                    request.getCountryName(),
                    request.getFlagUrl()
            );
            
            User updatedUser = userService.addFavoriteCountry(userPrincipal.getId(), favoriteCountry);
            
            if (updatedUser == null) {
                return ResponseEntity.status(500).body(createErrorResponse("Failed to add favorite"));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Country added to favorites");
            response.put("favoriteCountries", updatedUser.getFavoriteCountries());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/favorites/{countryCode}")
    public ResponseEntity<?> removeFavoriteCountry(@PathVariable String countryCode,
                                                 Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Use service method to remove favorite (will evict cache)
            User updatedUser = userService.removeFavoriteCountry(userPrincipal.getId(), countryCode);
            
            if (updatedUser == null) {
                return ResponseEntity.status(404).body(createErrorResponse("User not found"));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Country removed from favorites");
            response.put("favoriteCountries", updatedUser.getFavoriteCountries());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/getall/favorite")
    public ResponseEntity<?> getFavoriteCountries(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            System.out.println("getFavoriteCountries called with user.id: " + userPrincipal.getId());
            
            // Use cached service method
            Optional<User> userOptional = userService.getUserById(userPrincipal.getId());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(createErrorResponse("User not found"));
            }
            
            User user = userOptional.get();
            System.out.println("User found: " + user.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("favoriteCountries", user.getFavoriteCountries());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, String> updateRequest,
                                             Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            System.out.println("updateUserProfile called with: " + updateRequest);
            
            Optional<User> userOptional = userRepository.findById(userPrincipal.getId());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(createErrorResponse("User not found"));
            }
            
            User user = userOptional.get();
            
            if (updateRequest.containsKey("username")) {
                user.setUsername(updateRequest.get("username"));
            }
            
            if (updateRequest.containsKey("email")) {
                user.setEmail(updateRequest.get("email"));
            }
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("favoriteCountries", user.getFavoriteCountries());
            userInfo.put("createdAt", user.getCreatedAt());
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
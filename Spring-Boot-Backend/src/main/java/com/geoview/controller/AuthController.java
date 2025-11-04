package com.geoview.controller;

import com.geoview.dto.*;
import com.geoview.model.User;
import com.geoview.repository.UserRepository;
import com.geoview.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest,
                                        HttpServletResponse response) {
        
        System.out.println("Registering user: " + signUpRequest.getUsername());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("User with this username already exists"));
        }
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("User with this email already exists"));
        }
        
        // Create new user
        User user = new User(signUpRequest.getUsername(),
                           signUpRequest.getEmail(),
                           signUpRequest.getPassword());
        
        // Hash password before saving (like Node.js pre-save hook)
        user.hashPassword();
        
        userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(user.getId());
        
        // Set cookie
        Cookie cookie = new Cookie("token", jwt);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        cookie.setPath("/");
        response.addCookie(cookie);
        
        return ResponseEntity.ok(createSuccessResponse(
                "User registered successfully",
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
                                            HttpServletResponse response) {
        
        System.out.println("Login attempt: " + loginRequest.getEmail());
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);
        
        if (user == null || !user.comparePassword(loginRequest.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid email or password"));
        }
        
        String jwt = jwtUtils.generateJwtToken(user.getId());
        
        // Set cookie
        Cookie cookie = new Cookie("token", jwt);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        cookie.setPath("/");
        response.addCookie(cookie);
        
        return ResponseEntity.ok(createSuccessResponse(
                "Login successful",
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        ));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("success", true);
        responseMap.put("message", "Logout successful");
        
        return ResponseEntity.ok(responseMap);
    }
    
    private Map<String, Object> createSuccessResponse(String message, String token, String id, String username, String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("token", token);
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", id);
        userInfo.put("username", username);
        userInfo.put("email", email);
        response.put("user", userInfo);
        
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
package com.geoview.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @NotBlank
    @Size(min = 3, max = 20)
    @Indexed(unique = true)
    private String username;
    
    @NotBlank
    @Size(max = 50)
    @Email
    @Indexed(unique = true)
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 120)
    private String password;
    
    private List<FavoriteCountry> favoriteCountries = new ArrayList<>();
    
    private LocalDateTime createdAt;
    
    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with basic fields
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public List<FavoriteCountry> getFavoriteCountries() {
        return favoriteCountries;
    }
    
    public void setFavoriteCountries(List<FavoriteCountry> favoriteCountries) {
        this.favoriteCountries = favoriteCountries;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // Password hashing method (equivalent to Node.js pre-save hook)
    public void hashPassword() {
        if (this.password != null && !this.password.startsWith("$2a$")) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
            this.password = encoder.encode(this.password);
        }
    }
    
    // Compare password method (equivalent to Node.js comparePassword method)
    public boolean comparePassword(String candidatePassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(candidatePassword, this.password);
    }
}
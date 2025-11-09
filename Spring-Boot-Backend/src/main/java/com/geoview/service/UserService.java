package com.geoview.service;

import com.geoview.model.FavoriteCountry;
import com.geoview.model.User;
import com.geoview.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user profile with caching
     * Cache key: user:profile:{userId}
     * TTL: 10 minutes (configured in RedisConfig)
     */
    @Cacheable(value = "userProfile", key = "#userId")
    public Optional<User> getUserById(String userId) {
        System.out.println("Fetching user from database for userId: " + userId);
        return userRepository.findById(userId);
    }

    /**
     * Get user by username with caching
     * Cache key: user:username:{username}
     */
    @Cacheable(value = "userByUsername", key = "#username")
    public Optional<User> getUserByUsername(String username) {
        System.out.println("Fetching user from database for username: " + username);
        return userRepository.findByUsername(username);
    }

    /**
     * Save or update user and evict cache
     * Clears both profile and username caches for the user
     */
    @CacheEvict(value = {"userProfile", "userByUsername"}, key = "#user.id")
    public User saveUser(User user) {
        System.out.println("Saving user and evicting cache for userId: " + user.getId());
        return userRepository.save(user);
    }

    /**
     * Add favorite country and evict user cache
     */
    @CacheEvict(value = {"userProfile", "userByUsername"}, key = "#userId")
    public User addFavoriteCountry(String userId, FavoriteCountry favoriteCountry) {
        System.out.println("Adding favorite country and evicting cache for userId: " + userId);
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.getFavoriteCountries().add(favoriteCountry);
            return userRepository.save(user);
        }
        return null;
    }

    /**
     * Remove favorite country and evict user cache
     */
    @CacheEvict(value = {"userProfile", "userByUsername"}, key = "#userId")
    public User removeFavoriteCountry(String userId, String countryCode) {
        System.out.println("Removing favorite country and evicting cache for userId: " + userId);
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.getFavoriteCountries().removeIf(
                country -> country.getCountryCode().equals(countryCode)
            );
            return userRepository.save(user);
        }
        return null;
    }

    /**
     * Clear all user-related caches (for admin operations)
     */
    @CacheEvict(value = {"userProfile", "userByUsername"}, allEntries = true)
    public void clearAllUserCaches() {
        System.out.println("Clearing all user caches");
    }
}

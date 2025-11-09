package com.geoview.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/cache")
public class CacheController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * Check Redis connection health
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkRedisHealth() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test Redis connection by setting and getting a test key
            String testKey = "health:check";
            String testValue = "OK";
            
            redisTemplate.opsForValue().set(testKey, testValue);
            Object retrieved = redisTemplate.opsForValue().get(testKey);
            redisTemplate.delete(testKey);
            
            if (testValue.equals(retrieved)) {
                response.put("status", "UP");
                response.put("service", "Redis Cache");
                response.put("message", "Redis is connected and operational");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "DOWN");
                response.put("service", "Redis Cache");
                response.put("message", "Redis connection test failed");
                return ResponseEntity.status(503).body(response);
            }
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("service", "Redis Cache");
            response.put("message", "Redis connection error: " + e.getMessage());
            return ResponseEntity.status(503).body(response);
        }
    }

    /**
     * Get cache statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getCacheStats() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Get approximate key count
            Long keyCount = redisTemplate.getConnectionFactory()
                .getConnection()
                .dbSize();
            
            response.put("success", true);
            response.put("totalKeys", keyCount);
            response.put("cacheType", "Redis");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get cache stats: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Clear all caches (admin only - add proper authorization in production)
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllCaches() {
        Map<String, Object> response = new HashMap<>();
        try {
            redisTemplate.getConnectionFactory()
                .getConnection()
                .flushDb();
            
            response.put("success", true);
            response.put("message", "All caches cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to clear caches: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get cache keys by pattern
     */
    @GetMapping("/keys")
    public ResponseEntity<?> getCacheKeys(@RequestParam(defaultValue = "*") String pattern) {
        Map<String, Object> response = new HashMap<>();
        try {
            var keys = redisTemplate.keys(pattern);
            
            response.put("success", true);
            response.put("pattern", pattern);
            response.put("keys", keys);
            response.put("count", keys != null ? keys.size() : 0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get cache keys: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

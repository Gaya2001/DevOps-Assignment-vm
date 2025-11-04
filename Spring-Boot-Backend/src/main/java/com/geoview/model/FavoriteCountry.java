package com.geoview.model;

import jakarta.validation.constraints.NotBlank;

public class FavoriteCountry {
    
    @NotBlank
    private String countryCode;
    
    @NotBlank
    private String countryName;
    
    private String flagUrl;
    
    // Default constructor
    public FavoriteCountry() {}
    
    // Constructor
    public FavoriteCountry(String countryCode, String countryName, String flagUrl) {
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.flagUrl = flagUrl;
    }
    
    // Getters and Setters
    public String getCountryCode() {
        return countryCode;
    }
    
    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }
    
    public String getCountryName() {
        return countryName;
    }
    
    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }
    
    public String getFlagUrl() {
        return flagUrl;
    }
    
    public void setFlagUrl(String flagUrl) {
        this.flagUrl = flagUrl;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        FavoriteCountry that = (FavoriteCountry) o;
        return countryCode != null ? countryCode.equals(that.countryCode) : that.countryCode == null;
    }
    
    @Override
    public int hashCode() {
        return countryCode != null ? countryCode.hashCode() : 0;
    }
}
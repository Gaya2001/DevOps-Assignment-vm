package com.geoview.dto;

import jakarta.validation.constraints.NotBlank;

public class AddFavoriteRequest {
    @NotBlank
    private String countryCode;

    @NotBlank
    private String countryName;

    private String flagUrl;

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
}
import { countriesApi, serverApi } from './http-common.js';
import { setAuthToken } from './auth.js';

export const getAllCountries = async () => {
    try {
        // Try with specific fields to reduce payload size and avoid potential API issues
        const response = await countriesApi.get('/all?fields=name,cca3,flags,population,region,capital');
        console.log('getAllCountries response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching all countries:', error);
        // Fallback to basic endpoint if fields parameter fails
        try {
            const fallbackResponse = await countriesApi.get('/all');
            console.log('getAllCountries fallback response:', fallbackResponse.data);
            return fallbackResponse.data;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw fallbackError;
        }
    }
};

export const getCountryByName = async (name) => {
    try {
        const response = await countriesApi.get(`/name/${name}`);
        console.log(`getCountryByName (${name}) response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching country by name ${name}:`, error);
        throw error;
    }
};

export const getCountriesByRegion = async (region) => {
    try {
        const response = await countriesApi.get(`/region/${region}`);
        console.log(`getCountriesByRegion (${region}) response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching countries by region ${region}:`, error);
        throw error;
    }
};

export const getCountryByCode = async (code) => {
    try {
        const response = await countriesApi.get(`/alpha/${code}`);
        console.log(`getCountryByCode (${code}) response:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching country by code ${code}:`, error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await serverApi.post('/auth/register', userData);
        console.log('registerUser response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await serverApi.post('/auth/login', credentials);
        console.log('loginUser response:', response.data);
        setAuthToken(response.data.token);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await serverApi.post('/auth/logout');
        console.log('logoutUser response:', response.data);
        setAuthToken(null);
        return response.data;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await serverApi.get('/user/profile');
        console.log('getUserProfile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await serverApi.put('/user/profile', userData);
        console.log('updateUserProfile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};



export const addToFavorites = async (country) => {
    try {
        const response = await serverApi.post('/user/favorites', country);
        console.log('addToFavorites response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
};

export const removeFromFavorites = async (countryCode) => {
    try {
        const response = await serverApi.delete(`/user/favorites/${countryCode}`);
        console.log(`removeFromFavorites (${countryCode}) response:`, response.data);
        return response.data;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
};

export const getFavorites = async () => {
    try {
        const response = await serverApi.get('/user/getall/favorite');
        console.log('getFavorites response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw error;
    }
};

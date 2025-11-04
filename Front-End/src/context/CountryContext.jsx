import { createContext, useState, useEffect, useContext } from 'react';
import {
    getAllCountries,
    getCountryByName,
    getCountriesByRegion,
    addToFavorites,
    removeFromFavorites,
    getFavorites
} from '../services/api';
import { useAuth } from './AuthContext';

const CountryContext = createContext();

export const useCountries = () => useContext(CountryContext);

export const CountryProvider = ({ children }) => {
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const { isAuthenticated } = useAuth();

    // Fetch all countries on initial load
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllCountries();
                console.log('Fetched countries:', data); // Debugging line
                setCountries(data);
                setFilteredCountries(data);
            } catch (err) {
                console.error('Full error object:', err);
                console.error('Error response:', err.response);
                console.error('Error status:', err.response?.status);
                console.error('Error data:', err.response?.data);
                setError('Failed to fetch countries');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    // Fetch user's favorite countries when authenticated
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!isAuthenticated) {
                setFavorites([]);
                return;
            }

            try {
                const { favoriteCountries } = await getFavorites();
                setFavorites(favoriteCountries);
            } catch (err) {
                console.error('Failed to fetch favorites:', err);
            }
        };

        fetchFavorites();
    }, [isAuthenticated]);

    // Handle search and filter
    useEffect(() => {
        if (!countries.length) return;

        const applyFilters = async () => {
            setLoading(true);
            try {
                let result = [...countries];

                // Apply region filter if selected
                if (regionFilter) {
                    try {
                        const regionData = await getCountriesByRegion(regionFilter);
                        result = regionData;
                    } catch (err) {
                        console.error(`Error filtering by region ${regionFilter}:`, err);
                    }
                }

                // Apply search filter if provided
                if (searchTerm) {
                    try {
                        const searchData = await getCountryByName(searchTerm);
                        // If region is also selected, find intersection
                        if (regionFilter) {
                            const searchCodes = searchData.map(c => c.cca3);
                            result = result.filter(country => searchCodes.includes(country.cca3));
                        } else {
                            result = searchData;
                        }
                    } catch (err) {
                        console.error(`Error searching for ${searchTerm}:`, err);
                        result = []; // No results found
                    }
                }

                setFilteredCountries(result);
            } catch (err) {
                setError('Error applying filters');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many API calls
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, regionFilter, countries]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleRegionFilter = (region) => {
        setRegionFilter(region);
    };

    const addFavorite = async (country) => {
        if (!isAuthenticated) return;

        try {
            const countryData = {
                countryCode: country.cca3,
                countryName: country.name.common,
                flagUrl: country.flags.svg
            };

            const { favoriteCountries } = await addToFavorites(countryData);
            setFavorites(favoriteCountries);
        } catch (err) {
            console.error('Failed to add favorite:', err);
        }
    };

    const removeFavorite = async (countryCode) => {
        if (!isAuthenticated) return;

        try {
            const { favoriteCountries } = await removeFromFavorites(countryCode);
            setFavorites(favoriteCountries);
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    const isFavorite = (countryCode) => {
        return favorites.some(fav => fav.countryCode === countryCode);
    };

    const value = {
        countries,
        filteredCountries,
        favorites,
        loading,
        error,
        searchTerm,
        regionFilter,
        handleSearch,
        handleRegionFilter,
        addFavorite,
        removeFavorite,
        isFavorite
    };

    return (
        <CountryContext.Provider value={value}>
            {children}
        </CountryContext.Provider>
    );
};

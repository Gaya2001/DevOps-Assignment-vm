import { useState } from 'react';
import { useCountries } from '../context/CountryContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import CountryCard from '../components/CountryCard';
import HeroSection from '../components/HeroSection';
import Spinner from '../components/Spinner';

function HomePage() {
    const {
        filteredCountries,
        loading,
        error,
        handleRegionFilter,
        handleSearch,
        searchTerm,
        regionFilter
    } = useCountries();

    const [searchInput, setSearchInput] = useState(searchTerm);

    const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        handleSearch(e.target.value);
    };

    // Component for animated country card
    const AnimatedCountryCard = ({ country, index }) => {
        const [cardRef, isVisible] = useScrollAnimation({ 
            threshold: 0.1, 
            triggerOnce: true 
        });

        // Different animation styles based on card position
        const animationStyles = [
            'translate-y-8 opacity-0', // fade up
            'translate-x-8 opacity-0', // slide from right
            '-translate-x-8 opacity-0', // slide from left
            'scale-95 opacity-0' // scale up
        ];

        const visibleStyles = [
            'translate-y-0 opacity-100',
            'translate-x-0 opacity-100', 
            'translate-x-0 opacity-100',
            'scale-100 opacity-100'
        ];

        const animationStyle = index % 4;

        return (
            <div
                ref={cardRef}
                className={`transform transition-all duration-700 ease-out ${
                    isVisible 
                        ? visibleStyles[animationStyle]
                        : animationStyles[animationStyle]
                }`}
                style={{ 
                    transitionDelay: `${(index % 8) * 150}ms` 
                }}
            >
                <CountryCard country={country} />
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <HeroSection />

            {/* Search Section */}
            <div id="search-section" className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Find Your Country
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Search through 250+ countries and territories to discover detailed information, statistics, and insights
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search by country name, capital, or region..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                className="w-full px-6 py-4 pl-14 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                            />
                            <div className="absolute left-4 top-4 text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        handleSearch('');
                                    }}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Search Stats */}
                        {searchInput && (
                            <div className="mt-6 text-sm text-gray-500">
                                {filteredCountries.length > 0 ? (
                                    <span>Found {filteredCountries.length} countries matching "{searchInput}"</span>
                                ) : (
                                    <span>No countries found matching "{searchInput}"</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Countries Section */}
            <div id="countries-section" className="bg-gray-50 py-16 px-4">
                <div className="max-w-7xl mx-auto">
          

                    {/* Filter Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Browse by Region</h3>

                        <div className="flex items-center space-x-4">
                            <label htmlFor="region-filter" className="text-gray-700 font-medium">
                                Filter:
                            </label>
                            <select
                                id="region-filter"
                                value={regionFilter}
                                onChange={(e) => handleRegionFilter(e.target.value)}
                                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white min-w-[200px]"
                            >
                                <option value="">All Regions</option>
                                {regions.map((region) => (
                                    <option key={region} value={region.toLowerCase()}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Countries Grid */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center">
                            <div className="text-5xl mb-4">😕</div>
                            <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
                            <p>{error}</p>
                        </div>
                    ) : filteredCountries.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No countries found</h3>
                            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredCountries.map((country, index) => (
                                <AnimatedCountryCard 
                                    key={country.cca3} 
                                    country={country} 
                                    index={index % 12} // Reset animation delay every 12 cards
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;

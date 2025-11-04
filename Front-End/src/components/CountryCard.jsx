import { Link } from 'react-router-dom';
import { useCountries } from '../context/CountryContext';
import { useAuth } from '../context/AuthContext';

function CountryCard({ country, showDetails = true }) {
    const { addFavorite, removeFavorite, isFavorite } = useCountries();
    const { isAuthenticated } = useAuth();

    const formatPopulation = (population) => {
        if (!population || isNaN(population)) {
            return 'N/A';
        }
        return population.toLocaleString();
    };

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!country?.cca3) return; // Safety check

        if (isFavorite(country.cca3)) {
            removeFavorite(country.cca3);
        } else {
            addFavorite(country);
        }
    };

    return (
        <Link to={`/country/${country?.cca3 || 'unknown'}`} className="block group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:scale-105 border border-gray-100">
                {/* Flag Container */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={country?.flags?.svg || '/placeholder-flag.svg'}
                        alt={`Flag of ${country?.name?.common || 'Unknown Country'}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = '/placeholder-flag.svg';
                        }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Favorite Button */}
                    {isAuthenticated && (
                        <button
                            onClick={handleFavoriteClick}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill={country?.cca3 && isFavorite(country.cca3) ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                style={{ color: country?.cca3 && isFavorite(country.cca3) ? '#ef4444' : '#6b7280' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    )}

                    {/* Region Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-lg">
                        {country?.region || 'N/A'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {country?.name?.common || 'Unknown Country'}
                    </h2>

                    {showDetails && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Population</p>
                                    <p className="font-semibold text-gray-900">{formatPopulation(country.population)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Capital</p>
                                    <p className="font-semibold text-gray-900">
                                        {country.capital && country.capital.length > 0
                                            ? country.capital.join(', ')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                View Details
                            </span>
                            <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default CountryCard;
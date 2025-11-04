import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCountryByCode } from '../services/api';
import Spinner from '../components/Spinner';
import { useCountries } from '../context/CountryContext';
import { useAuth } from '../context/AuthContext';

function CountryDetailPage() {
    const [country, setCountry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { code } = useParams();
    const { addFavorite, removeFavorite, isFavorite } = useCountries();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                setLoading(true);
                const data = await getCountryByCode(code);
                setCountry(data[0]);
            } catch (err) {
                setError('Failed to fetch country details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCountry();
    }, [code]);

    const handleFavoriteClick = () => {
        if (isFavorite(country.cca3)) {
            removeFavorite(country.cca3);
        } else {
            addFavorite(country);
        }
    };

    const formatPopulation = (population) => {
        return population.toLocaleString();
    };

    const getLanguages = () => {
        return country.languages
            ? Object.values(country.languages).join(', ')
            : 'N/A';
    };

    const getCurrencies = () => {
        return country.currencies
            ? Object.values(country.currencies)
                .map((currency) => currency.name)
                .join(', ')
            : 'N/A';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-lg text-gray-600">Loading country details...</p>
                </div>
            </div>
        );
    }

    if (error || !country) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-8">{error || 'Country not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="mb-8 animate-fade-in-up">
                    <Link 
                        to="/" 
                        className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-lg border border-white/20 text-gray-700 font-semibold rounded-2xl shadow-lg hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Countries
                    </Link>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
                    {/* Flag Section */}
                    <div className="animate-fade-in-up">
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
                            <div className="relative group">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse"></div>
                                )}
                                <img
                                    src={country.flags.svg}
                                    alt={`Flag of ${country.name.common}`}
                                    className={`w-full h-auto rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-105 ${
                                        imageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-2xl">
                                    <div className="text-sm opacity-90">Population</div>
                                    <div className="text-xl font-bold">{formatPopulation(country.population)}</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-4 rounded-2xl">
                                    <div className="text-sm opacity-90">Region</div>
                                    <div className="text-xl font-bold">{country.region}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {country.name.common}
                                    </h1>
                                    <p className="text-xl text-gray-600">
                                        {country.name.nativeName
                                            ? Object.values(country.name.nativeName)[0].common
                                            : country.name.common}
                                    </p>
                                </div>

                                {isAuthenticated && (
                                    <button
                                        onClick={handleFavoriteClick}
                                        className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/70 transition-all duration-300 transform hover:scale-110 group"
                                    >
                                        <svg
                                            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                                            fill={isFavorite(country.cca3) ? 'currentColor' : 'none'}
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            style={{ color: isFavorite(country.cca3) ? '#dc2626' : '#6b7280' }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-semibold text-gray-700">Capital</span>
                                        </div>
                                        <p className="text-lg text-gray-800">
                                            {country.capital && country.capital.length > 0
                                                ? country.capital.join(', ')
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-semibold text-gray-700">Sub Region</span>
                                        </div>
                                        <p className="text-lg text-gray-800">{country.subregion || 'N/A'}</p>
                                    </div>

                                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                            </svg>
                                            <span className="font-semibold text-gray-700">Domain</span>
                                        </div>
                                        <p className="text-lg text-gray-800">
                                            {country.tld ? country.tld.join(', ') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            <span className="font-semibold text-gray-700">Currencies</span>
                                        </div>
                                        <p className="text-lg text-gray-800">{getCurrencies()}</p>
                                    </div>

                                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="font-semibold text-gray-700">Languages</span>
                                        </div>
                                        <p className="text-lg text-gray-800">{getLanguages()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Border Countries */}
                            {country.borders && country.borders.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                                        </svg>
                                        Border Countries
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {country.borders.map((border) => (
                                            <Link
                                                key={border}
                                                to={`/country/${border}`}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                            >
                                                {border}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountryDetailPage;
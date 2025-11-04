import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCountries } from '../context/CountryContext';
import CountryCard from '../components/CountryCard';

function ProfilePage() {
    const { user, logout, loading, error } = useAuth();
    const { favorites, removeFavorite } = useCountries();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const navigate = useNavigate();

    // Convert backend favorite format to frontend country format
    const convertFavoriteToCountryFormat = (favorite) => {
        if (favorite.cca3 && favorite.flags) {
            // Already in correct format (from countries API)
            return favorite;
        }
        
        // Convert from backend FavoriteCountry format
        return {
            cca3: favorite.countryCode || favorite.cca3,
            name: {
                common: favorite.countryName || favorite.name?.common || 'Unknown Country'
            },
            flags: {
                svg: favorite.flagUrl || favorite.flags?.svg || '/placeholder-flag.svg'
            },
            population: favorite.population || null,
            capital: favorite.capital || ['N/A'],
            region: favorite.region || 'N/A',
            subregion: favorite.subregion || 'N/A',
            area: favorite.area || null
        };
    };

    // Initialize form data from user info
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Enter a valid email address';
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setUpdateSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setUpdateLoading(true);
        try {
            // Simulate API call - replace with actual updateUserProfile call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUpdateSuccess(true);
            setIsEditing(false);
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Profile update error:', error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                        Your Profile
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                        Manage your account and explore your favorite countries
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Profile Information Card */}
                    <div className="lg:col-span-1 order-1 lg:order-1">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8 animate-fade-in-up">
                            {/* Profile Header */}
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                                        {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                                    {user?.username || user?.name || 'User'}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                            </div>

                            {/* Success Message */}
                            {updateSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6 animate-fade-in-up">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Profile updated successfully!
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </div>
                                </div>
                            )}

                            {/* Profile Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 placeholder-gray-400 focus:outline-none focus:bg-white ${
                                                !isEditing 
                                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                                                    : formErrors.username 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            } ${isEditing ? 'focus:ring-4' : ''}`}
                                            placeholder="Your username"
                                        />
                                    </div>
                                    {formErrors.username && (
                                        <p className="text-red-500 text-sm flex items-center mt-1">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 placeholder-gray-400 focus:outline-none focus:bg-white ${
                                                !isEditing 
                                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                                                    : formErrors.email 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            } ${isEditing ? 'focus:ring-4' : ''}`}
                                            placeholder="Your email"
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-red-500 text-sm flex items-center mt-1">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                        >
                                            <div className="flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Profile
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={updateLoading}
                                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {updateLoading ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Saving...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save
                                                    </div>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setFormErrors({});
                                                    setFormData({
                                                        username: user?.username || user?.name || '',
                                                        email: user?.email || '',
                                                    });
                                                }}
                                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Favorites Section */}
                    <div className="lg:col-span-2 order-2 lg:order-2">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-0">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Favorite Countries
                                </h3>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-center">
                                    {favorites?.length || 0} countries
                                </span>
                            </div>

                            {!favorites || favorites.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 lg:py-16">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No favorites yet</h4>
                                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Start exploring countries and add them to your favorites!</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Explore Countries
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {favorites.map((country, index) => (
                                        <CountryCard 
                                            key={country.countryCode || country.cca3 || index} 
                                            country={convertFavoriteToCountryFormat(country)} 
                                            showDetails={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
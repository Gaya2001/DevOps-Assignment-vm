import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCountries } from '../context/CountryContext';
import { updateUserProfile } from '../services/api'; // Add this import

function ProfilePage() {
    const { user, logout, loading, error } = useAuth();
    const { favorites, removeFavorite } = useCountries(); // Get favorites and removeFavorite from CountryContext
    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const navigate = useNavigate();

    // Initialize form data from user info
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
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

        // Clear error and success message when typing
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (updateSuccess) {
            setUpdateSuccess(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const response = await updateUserProfile(formData);
            if (response.success) {
                setUpdateSuccess(true);
                setIsEditing(false);
            }
        } catch (err) {
            setFormErrors({ general: 'Failed to update profile' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigate to country details page
    const navigateToCountry = (countryCode) => {
        navigate(`/country/${countryCode}`);
    };

    // Handle unfavoriting a country
    const handleRemoveFavorite = async (countryCode) => {
        await removeFavorite(countryCode);
    };

    if (!user) {
        return <div className="text-center p-8">Loading user profile...</div>;
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-4">Profile</h1>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                    {error}
                </div>
            )}

            {formErrors.general && (
                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                    {formErrors.general}
                </div>
            )}

            {updateSuccess && (
                <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                    Profile updated successfully!
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`input-field ${formErrors.username ? 'border-red-500' : ''}`}
                            />
                            {formErrors.username && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500">Username</h3>
                            <p className="text-lg">{user.username}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="text-lg">{user.email}</p>
                        </div>

                        <div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Favorite Countries</h2>

                {favorites.length === 0 ? (
                    <p className="text-gray-700">You haven't added any countries to your favorites yet.</p>
                ) : (
                    <div>
                        <p className="text-gray-700 mb-3">You have {favorites.length} favorite {favorites.length === 1 ? 'country' : 'countries'}:</p>
                        <div className="space-y-2">
                            {favorites.map((favorite) => (
                                <div key={favorite.countryCode} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                    <div
                                        className="flex items-center cursor-pointer flex-1"
                                        onClick={() => navigateToCountry(favorite.countryCode)}
                                    >
                                        <img
                                            src={favorite.flagUrl}
                                            alt={`${favorite.countryName} flag`}
                                            className="w-8 h-5 mr-2 object-cover"
                                        />
                                        <span>{favorite.countryName}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFavorite(favorite.countryCode)}
                                        className="text-red-500 hover:text-red-700 px-2 py-1"
                                        title="Remove from favorites"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </div>

            <div className="text-center">

            </div>
        </div>
    );
}

export default ProfilePage;

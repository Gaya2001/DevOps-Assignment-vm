import { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile, loginUser, registerUser, logoutUser, updateUserProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                setLoading(true);
                // Check if token exists before making API call
                const token = localStorage.getItem('token');
                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
                
                const { user } = await getUserProfile();
                setUser(user);
            } catch (err) {
                // If error, user is not authenticated
                setUser(null);
                // Clear invalid token
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const { user } = await loginUser(credentials);
            setUser(user);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const { user } = await registerUser(userData);
            setUser(user);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };


    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const { user: updatedUser } = await updateUserProfile(userData);
            setUser(updatedUser);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Profile update failed');
            return false;
        } finally {
            setLoading(false);
        }

    };


    const logout = async () => {
        try {
            setLoading(true);
            await logoutUser();
            setUser(null);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Logout failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const authContext = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Always call hooks first, then handle loading state
    const { isAuthenticated, user, logout } = authContext || {};
    const isLoading = !authContext || authContext.loading;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(scrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActiveLink = (path) => location?.pathname === path;

    // Handle loading state after all hooks are called
    if (isLoading) {
        return (
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-16">
                        <div className="animate-pulse flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                            <div className="w-24 h-6 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <header className={`sticky top-0 z-50 transition-all duration-500 ${
            isScrolled 
                ? 'bg-white shadow-2xl border-b-2 border-gray-400' 
                : 'bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-200'
        }`}
        style={isScrolled ? {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
        } : {}}>
            {/* Enhanced visibility elements when scrolled */}
            {isScrolled && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-100/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
                </>
            )}
            <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <div className="flex items-center h-16 lg:h-18 w-full">
                    {/* Logo - Always stays on the left */}
                    <div className="flex items-center flex-shrink-0">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 sm:space-x-3 group relative"
                            aria-label="GeoView Home"
                        >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${
                                isScrolled ? 'shadow-xl' : 'shadow-lg'
                            } group-hover:shadow-xl`}>
                                <span className="text-white font-bold text-sm sm:text-lg" role="img" aria-label="Globe">🌍</span>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-lg sm:text-2xl font-bold leading-none whitespace-nowrap transition-all duration-300 ${
                                    isScrolled 
                                        ? 'text-gray-900 drop-shadow-md' 
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                                }`}
                                style={isScrolled ? {
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                } : {}}>
                                    GeoView
                                </span>
                                <span className={`text-xs hidden sm:block font-medium whitespace-nowrap transition-all duration-300 ${
                                    isScrolled ? 'text-gray-700' : 'text-gray-500'
                                }`}>
                                    Explore Countries
                                </span>
                            </div>
                        </Link>
                    </div>
                    
                    {/* Spacer to push navigation to the right */}
                    <div className="flex-grow"></div>

                    {/* Desktop Navigation - Always stays on the right */}
                    <div className="hidden lg:flex items-center space-x-4 xl:space-x-8 flex-shrink-0">
                        {/* Navigation Links */}
                        <nav className="flex items-center space-x-4 xl:space-x-6">
                            <Link 
                                to="/" 
                                className={`relative text-sm xl:text-base font-medium transition-all duration-300 group ${
                                    isActiveLink('/') 
                                        ? 'text-blue-600' 
                                        : isScrolled 
                                            ? 'text-gray-900 hover:text-blue-600' 
                                            : 'text-gray-700 hover:text-blue-600'
                                } ${isScrolled ? 'font-semibold' : ''}`}
                                style={isScrolled ? {
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                } : {}}
                            >
                                <span className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Home</span>
                                </span>
                                {isActiveLink('/') && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                                )}
                            </Link>
                            
                            {isAuthenticated ? (
                                <>
                                    <Link 
                                        to="/profile" 
                                        className={`relative text-sm xl:text-base font-medium transition-all duration-300 group ${
                                            isActiveLink('/profile') 
                                                ? 'text-blue-600' 
                                                : isScrolled 
                                                    ? 'text-gray-900 hover:text-blue-600' 
                                                    : 'text-gray-700 hover:text-blue-600'
                                        } ${isScrolled ? 'font-semibold' : ''}`}
                                        style={isScrolled ? {
                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                        } : {}}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <div className="relative">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                            </div>
                                            <span className="truncate max-w-24 xl:max-w-32">
                                                {user?.name || user?.username || 'Profile'}
                                            </span>
                                        </span>
                                        {isActiveLink('/profile') && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                                        )}
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm xl:text-base rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                                        aria-label="Logout"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`relative text-sm xl:text-base font-medium transition-all duration-300 group ${
                                            isActiveLink('/login') 
                                                ? 'text-blue-600' 
                                                : isScrolled 
                                                    ? 'text-gray-900 hover:text-blue-600' 
                                                    : 'text-gray-700 hover:text-blue-600'
                                        } ${isScrolled ? 'font-semibold' : ''}`}
                                        style={isScrolled ? {
                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                        } : {}}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Login</span>
                                        </span>
                                        {isActiveLink('/login') && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                                        )}
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm xl:text-base rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                                        aria-label="Sign up for GeoView"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>Sign Up</span>
                                        </span>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Mobile/Tablet Menu Button - Always stays on the right */}
                    <div className="lg:hidden flex items-center flex-shrink-0">
                        <button
                            onClick={toggleMenu}
                            className={`relative p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                                isScrolled 
                                    ? 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 shadow-lg border border-gray-300' 
                                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                            }`}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                    >
                        <div className="relative w-6 h-6">
                            <span
                                className={`absolute block w-6 h-0.5 transition-all duration-300 ${
                                    isMenuOpen ? 'rotate-45 top-2.5' : 'top-1'
                                } ${isScrolled ? 'bg-gray-900 shadow-sm' : 'bg-gray-700'}`}
                            />
                            <span
                                className={`absolute block w-6 h-0.5 transition-all duration-300 top-2.5 ${
                                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                                } ${isScrolled ? 'bg-gray-900 shadow-sm' : 'bg-gray-700'}`}
                            />
                            <span
                                className={`absolute block w-6 h-0.5 transition-all duration-300 ${
                                    isMenuOpen ? '-rotate-45 top-2.5' : 'top-4'
                                } ${isScrolled ? 'bg-gray-900 shadow-sm' : 'bg-gray-700'}`}
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile/Tablet Menu */}
                <div 
                    className={`mobile-menu-container lg:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-in-out ${
                        isMenuOpen 
                            ? 'opacity-100 visible translate-y-0' 
                            : 'opacity-0 invisible -translate-y-4'
                    }`}
                >
                    <div className="mx-4 sm:mx-6 mt-2 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                        {/* Mobile Navigation */}
                        <nav className="p-4 sm:p-6 space-y-2">
                            <Link 
                                to="/" 
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                                    isActiveLink('/') 
                                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-500' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                }`} 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="flex-1">Home</span>
                                {isActiveLink('/') && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </Link>
                            
                            {isAuthenticated ? (
                                <>
                                    <Link 
                                        to="/profile" 
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                                            isActiveLink('/profile') 
                                                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-500' 
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`} 
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="relative">
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                        </div>
                                        <div className="flex-1">
                                            <span className="block">Profile</span>
                                            <span className="text-xs text-gray-500 block truncate">
                                                {user?.name || user?.username}
                                            </span>
                                        </div>
                                        {isActiveLink('/profile') && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </Link>
                                    
                                    <div className="pt-2 border-t border-gray-100">
                                        <button 
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium group"
                                        >
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                                            isActiveLink('/login') 
                                                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-500' 
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`} 
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="flex-1">Login</span>
                                        {isActiveLink('/login') && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </Link>
                                    
                                    <div className="pt-2 border-t border-gray-100">
                                        <Link 
                                            to="/register" 
                                            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>Sign Up</span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
                
                {/* Mobile Menu Backdrop */}
                {isMenuOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
                </div>
            </div>
        </header>
    );
}

export default Header;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCountries } from '../context/CountryContext';

// Video served directly from Cloud Storage with automatic CDN benefits
const globeVideo = 'https://storage.googleapis.com/kavindu-video-assets/7429830-hd_1920_1080_25fps%20(1).mp4';

function HeroSection() {
    const { isAuthenticated } = useAuth();
    const { filteredCountries } = useCountries();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showFullHero, setShowFullHero] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [blurIntensity, setBlurIntensity] = useState(0);

    // Debug: Check if video file is imported correctly
    console.log('Globe video path:', globeVideo);

    // Carousel of featured countries
    const featuredCountries = filteredCountries?.slice(0, 5) || [];

    useEffect(() => {
        if (featuredCountries.length > 0) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % featuredCountries.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [featuredCountries.length]);

    // Auto-minimize hero after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFullHero(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Scroll effect for blur animation
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            
            // Calculate blur intensity based on scroll position
            // Max blur at 300px scroll, adjust this value as needed
            const maxScroll = 300;
            const calculatedBlur = Math.min(currentScrollY / maxScroll, 1) * 8; // Max 8px blur
            setBlurIntensity(calculatedBlur);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToContent = () => {
        setShowFullHero(false);
        document.getElementById('search-section')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    };

    return (
        <div className={`relative flex items-center justify-center overflow-hidden transition-all duration-1000 ${
            showFullHero ? 'min-h-screen' : 'min-h-[70vh]'
        }`}>
            {/* Minimize Button */}
            {showFullHero && (
                <button
                    onClick={() => setShowFullHero(false)}
                    className="absolute top-4 right-4 z-20 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 group"
                    title="Minimize hero section"
                >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}

            {/* Video Background - Full Screen */}
            <div className="absolute inset-0 overflow-hidden">
                {!videoError ? (
                    <video
                        key="globe-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ 
                            minWidth: '100%',
                            minHeight: '100%',
                            objectFit: 'cover'
                        }}
                        onError={() => {
                            console.log('Video failed to load');
                            setVideoError(true);
                        }}
                        onLoadStart={() => {
                            console.log('Video loading started');
                        }}
                        onCanPlay={() => {
                            console.log('Video can play');
                        }}
                        onLoadedData={() => {
                            console.log('Video data loaded');
                        }}
                    >
                        <source src={globeVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                /* Fallback subtle background when video fails to load */
                <div className="absolute inset-0 bg-gray-900"></div>
            )}
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

            {/* Hero Content */}
            <div className="relative z-30 text-center px-4 max-w-4xl mx-auto">
                <div 
                    className="animate-fade-in-up transition-all duration-300"
                    style={{ 
                        filter: `blur(${blurIntensity}px)`,
                        transform: `translateY(${scrollY * 0.5}px)`,
                        opacity: Math.max(1 - (scrollY / 400), 0.3)
                    }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Discover the
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400 animate-gradient">
                            World
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Explore detailed information about every country on Earth. 
                        From population statistics to cultural insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button 
                            onClick={scrollToContent}
                            className="group relative px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                            <span className="relative z-10">Start Exploring</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-0 bg-white rounded-full group-hover:scale-95 transition-transform duration-300"></div>
                        </button>

                        {!isAuthenticated && (
                            <Link 
                                to="/register" 
                                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg transition-all duration-300 hover:bg-white hover:text-gray-900 hover:scale-105"
                            >
                                Join for Free
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">195+</div>
                            <div className="text-gray-200">Countries</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">7.8B+</div>
                            <div className="text-gray-200">Population</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-gray-200">Access</div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default HeroSection;
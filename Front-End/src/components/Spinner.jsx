// src/components/Spinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

function Spinner({ size = 'md', fullPage = false }) {
    // Define size classes
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const spinnerElement = (
        <div className="flex items-center justify-center">
            <div className="relative">
                {/* Outer ring */}
                <div className={`${sizeClasses[size]} border-4 border-blue-200 rounded-full animate-spin`}>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                
                {/* Inner dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    // If fullPage is true, show the spinner centered in the page
    if (fullPage) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                <div className="text-center bg-white rounded-2xl p-8 shadow-2xl" role="status">
                    {spinnerElement}
                    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Default inline spinner
    return (
        <div className="inline-flex" role="status">
            {spinnerElement}
            <span className="sr-only">Loading...</span>
        </div>
    );
}

Spinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    fullPage: PropTypes.bool
};

export default Spinner;

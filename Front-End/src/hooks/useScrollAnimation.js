import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (options = {}) => {
    const elementRef = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Optionally unobserve after animation triggers
                    if (options.triggerOnce) {
                        observer.unobserve(entry.target);
                    }
                } else if (!options.triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '0px',
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [options.threshold, options.rootMargin, options.triggerOnce]);

    return [elementRef, isVisible];
};
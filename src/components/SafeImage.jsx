import React, { useState, useEffect } from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';

/**
 * A safe image component that handles broken links by showing a dummy/placeholder image.
 * 
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text for the image
 * @param {object} style - Inline styles for the image element
 * @param {string} className - CSS class names
 * @param {string} fallbackIcon - Lucide icon component to show if both src and fallback image fail
 */
const SafeImage = ({ src, alt, style, className, fallbackIcon: FallbackIcon = Package, apiUrl = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5000' }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Reset error state and imgSrc when src changes
    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(null);
        }
    };

    if (!imgSrc) {
        return (
            <div
                className={`safe-image-placeholder ${className || ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.05)', // Very subtle background
                    color: 'hsl(var(--muted-foreground))',
                    borderRadius: style?.borderRadius || '8px',
                    ...style
                }}
            >
                <FallbackIcon size={style?.width ? Math.min(style.width / 1.8, 24) : 24} strokeWidth={1.5} />
            </div>
        );
    }

    // Determine the full URL
    // If it's a blob, base64, or already absolute http, use it as is
    const isAbsolute = imgSrc.startsWith('http') || imgSrc.startsWith('blob:') || imgSrc.startsWith('data:');
    const fullUrl = isAbsolute ? imgSrc : `${apiUrl}/${imgSrc.startsWith('/') ? imgSrc.substring(1) : imgSrc}`;

    return (
        <img
            src={fullUrl}
            alt={alt || 'Product Image'}
            className={className}
            style={{ objectFit: 'cover', ...style }}
            onError={handleError}
        />
    );
};

export default SafeImage;

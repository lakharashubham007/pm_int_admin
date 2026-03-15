/**
 * Builds a public URL for a profile image stored on the backend.
 * 
 * The backend serves uploads as static files at /uploads/...
 * Stored values may be:
 *   - A full URL already: "http://localhost:5000/uploads/profiles/foo.jpg"
 *   - A relative path:     "uploads/profiles/foo.jpg"
 *   - Just a filename:     "foo.jpg"
 */

const BACKEND_URL = import.meta.env.VITE_IMAGE_API_URL;

export function getImageUrl(imagePath) {
    if (!imagePath) return null;

    // Already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Has uploads/ prefix already (common for hero images or full paths)
    if (imagePath.includes('uploads/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${BACKEND_URL}${cleanPath}`;
    }

    // Special check for hero, about, or gallery images (they are in the same folder)
    if (imagePath.startsWith('hero_') || imagePath.startsWith('about_') || imagePath.startsWith('gallery_')) {
        return `${BACKEND_URL}/uploads/hero/${imagePath}`;
    }

    // Default fallback for staff/profiles if just a filename is provided
    return `${BACKEND_URL}/uploads/profiles/${imagePath}`;
}

export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export { BACKEND_URL };

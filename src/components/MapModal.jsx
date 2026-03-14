import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { X, MapPin, Search, Check, Navigation, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import './MapModal.css'; // Isolated advanced styling

const libraries = ['places'];
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi

const MapModal = ({ isOpen, onClose, onConfirm, initialLat, initialLng, initialAddress }) => {
    const [map, setMap] = useState(null);
    const [markerPos, setMarkerPos] = useState(defaultCenter);
    const [addressText, setAddressText] = useState('');
    const [addressComponents, setAddressComponents] = useState({ country: '', state: '', city: '', pincode: '' });
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isDraggingPin, setIsDraggingPin] = useState(false);
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialLat && initialLng) {
                const pos = { lat: parseFloat(initialLat), lng: parseFloat(initialLng) };
                setMarkerPos(pos);
                setAddressText(initialAddress || '');
                reverseGeocode(pos);
            } else {
                // Try to get actual current location instead of defaulting to New Delhi
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                            setMarkerPos(pos);
                            reverseGeocode(pos);
                        },
                        () => {
                            setMarkerPos(defaultCenter);
                        }
                    );
                } else {
                    setMarkerPos(defaultCenter);
                }
            }
        }
    }, [isOpen, initialLat, initialLng, initialAddress]);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
        if (initialLat && initialLng) {
            mapInstance.panTo({ lat: parseFloat(initialLat), lng: parseFloat(initialLng) });
            mapInstance.setZoom(16);
        }
    }, [initialLat, initialLng]);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);

    const extractLocationDetails = (components) => {
        let country = ''; let state = ''; let city = ''; let pincode = '';
        if (!components) return { country, state, city, pincode };

        for (const component of components) {
            const types = component.types;
            if (types.includes('country')) {
                country = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
            }
            if (types.includes('locality')) {
                city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_3')) {
                city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_2')) {
                city = component.long_name;
            }
            if (types.includes('postal_code')) {
                pincode = component.long_name;
            }
        }
        return { country, state, city, pincode };
    };

    const reverseGeocode = (latLng) => {
        setIsGeocoding(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK') {
                if (results[0]) {
                    setAddressText(results[0].formatted_address);
                    setAddressComponents(extractLocationDetails(results[0].address_components));
                }
            } else {
                console.error("Geocoder failed due to: " + status);
            }
        });
    };

    const handleMapClick = (e) => {
        if (map) {
            map.panTo({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    };

    const handleMapIdle = () => {
        setIsDraggingPin(false);
        if (map) {
            const center = map.getCenter();
            if (center) {
                const newPos = { lat: center.lat(), lng: center.lng() };
                const threshold = 0.00001;
                // Only trigger geocode if the map center actually moved from our known markerPos
                if (Math.abs(markerPos.lat - newPos.lat) > threshold || Math.abs(markerPos.lng - newPos.lng) > threshold) {
                    setMarkerPos(newPos);
                    reverseGeocode(newPos);
                }
            }
        }
    };

    useEffect(() => {
        let listener = null;

        if (isLoaded && isOpen && inputRef.current && !autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ['geometry', 'formatted_address', 'name']
            });

            listener = autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current.getPlace();
                if (place.geometry && place.geometry.location) {
                    const newPos = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    setMarkerPos(newPos);
                    setAddressText(place.formatted_address || place.name || '');
                    setAddressComponents(extractLocationDetails(place.address_components));

                    if (map) {
                        map.panTo(newPos);
                        map.setZoom(16);
                    }
                } else {
                    toast.error("No exact location found for this place.");
                }
            });
        }

        return () => {
            if (listener) {
                window.google.maps.event.removeListener(listener);
                autocompleteRef.current = null; // Reset on every cleanup to guarantee a fresh bind
            }
        };
    }, [isLoaded, map, isOpen]);
    const handleGetCurrentLocation = () => {
        if ("geolocation" in navigator) {
            toast.loading("Fetching location...", { id: 'geoToast' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setMarkerPos(newPos);
                    reverseGeocode(newPos);
                    if (map) {
                        map.panTo(newPos);
                        map.setZoom(16);
                    }
                    toast.success("Location found!", { id: 'geoToast' });
                },
                (error) => {
                    toast.error("Failed to acquire location. Proceeding with defaults.", { id: 'geoToast' });
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
        }
    };

    const handleConfirm = () => {
        if (!markerPos.lat || !markerPos.lng) {
            toast.error("Please select a location on the map");
            return;
        }
        onConfirm({
            latitude: markerPos.lat,
            longitude: markerPos.lng,
            addressLine1: addressText,
            ...addressComponents
        });
        onClose();
    };

    if (!isOpen) return null;

    if (loadError) {
        return createPortal(
            <div className="map-modal-overlay">
                <div className="map-modal-container" style={{ padding: '2rem', textAlign: 'center', height: 'auto' }}>
                    <h3 style={{ color: 'hsl(var(--destructive))' }}>Map Loading Error</h3>
                    <p>Google Maps could not load. Check API Key or Network.</p>
                    <button className="secondary-button" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="map-modal-overlay" onClick={(e) => { if (e.target.className.includes('map-modal-overlay')) onClose(); }}>
            <div className="map-modal-container">
                {/* Visual Accent */}
                <div className="map-modal-gradient-bar" />

                <div className="map-modal-content">

                    {/* Header */}
                    <div className="map-modal-header">
                        <div>
                            <h3 className="map-modal-title">
                                <Map size={24} style={{ color: 'hsl(var(--primary))' }} />
                                Interactive Location Pin
                            </h3>
                            <p className="map-modal-subtitle">Drag the pin or click on the map to set exact geographical coordinates</p>
                        </div>
                        <button onClick={onClose} className="map-modal-close-btn" title="Close Map">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Layout containing Map and Inputs */}
                    <div className="map-modal-body">

                        {/* Google Map Section */}
                        <div style={{ flex: '0 0 350px', minHeight: '300px', position: 'relative', borderRadius: '1rem', overflow: 'hidden', border: '1px solid hsl(var(--border) / 0.5)' }}>
                            {/* Floating Search Controls relative to map */}
                            <div className="map-controls-floating" style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                                {isLoaded && (
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Search places..."
                                            className="map-modal-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') e.preventDefault();
                                            }}
                                            style={{
                                                paddingLeft: '2.5rem',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                                border: '1px solid hsl(var(--border))',
                                                height: '48px',
                                                background: 'hsl(var(--card))',
                                            }}
                                        />
                                        <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none', zIndex: 11 }} />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    className="map-current-location-btn"
                                    title="Go to Current Location"
                                >
                                    <Navigation size={18} /> <span className="current-loc-text">Current Location</span>
                                </button>
                            </div>

                            {isLoaded ? (
                                <>
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={markerPos}
                                        zoom={16}
                                        onClick={handleMapClick}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                        onDragStart={() => setIsDraggingPin(true)}
                                        onIdle={handleMapIdle}
                                        options={{
                                            disableDefaultUI: false,
                                            zoomControl: true,
                                            zoomControlOptions: {
                                                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM
                                            },
                                            streetViewControl: true,
                                            streetViewControlOptions: {
                                                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM
                                            },
                                            mapTypeControl: true, // Enabled for Satellite/Map toggle
                                            mapTypeControlOptions: {
                                                position: window.google?.maps?.ControlPosition?.LEFT_BOTTOM,
                                                style: window.google?.maps?.MapTypeControlStyle?.HORIZONTAL_BAR
                                            },
                                            fullscreenControl: false,
                                            draggableCursor: 'crosshair', // Changes default hand to crosshair pin
                                            draggingCursor: 'grabbing',
                                            styles: [
                                                {
                                                    "featureType": "poi",
                                                    "stylers": [{ "visibility": "simplified" }]
                                                }
                                            ]
                                        }}
                                    />
                                    {/* CSS Center Pin Overlay */}
                                    <div className={`map-center-pin-container ${isDraggingPin ? 'is-dragging' : ''}`}>
                                        <div className="map-center-pin" />
                                        <div className="map-center-shadow" />
                                    </div>
                                </>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--secondary) / 0.3)' }}>
                                    Initializing Spatial Engine...
                                </div>
                            )}
                        </div>

                        {/* Data Inputs Section */}
                        <div className="map-modal-inputs-grid">
                            <div className="map-modal-input-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="map-modal-label">Extracted / Manual Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="map-modal-input"
                                        value={addressText}
                                        onChange={(e) => setAddressText(e.target.value)}
                                        placeholder="Address will auto-populate here from pin..."
                                        style={{ paddingRight: isGeocoding ? '40px' : '1rem' }}
                                    />
                                    {isGeocoding && (
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                                            <div className="loader-spinner" style={{ width: '16px', height: '16px', borderTopColor: 'hsl(var(--primary))' }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="map-modal-input-group">
                                <label className="map-modal-label">Latitude</label>
                                <input
                                    type="text"
                                    className="map-modal-input"
                                    value={markerPos.lat?.toFixed(6) || '--'}
                                    readOnly
                                />
                            </div>

                            <div className="map-modal-input-group">
                                <label className="map-modal-label">Longitude</label>
                                <input
                                    type="text"
                                    className="map-modal-input"
                                    value={markerPos.lng?.toFixed(6) || '--'}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border) / 0.5)' }}>
                            <button className="secondary-button" onClick={onClose} style={{ padding: '0.8rem 1.5rem', borderRadius: '0.75rem' }}>Cancel</button>
                            <button className="primary-button" onClick={handleConfirm} style={{ padding: '0.8rem 1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={18} /> Apply Coordinates
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MapModal;

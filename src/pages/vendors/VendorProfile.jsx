import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../../store/authStore';
import vendorService from '../../services/vendorService';
import {
    ArrowLeft, Save, Building2, Landmark, User, Zap, Box, Layers, Image as ImageIcon, FileText, ChevronRight, ChevronLeft, MapPin, X, RefreshCw, Plus, Trash2, UploadCloud, File, Shield, Camera, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../employee/Employee.css';
import '../Profile.css';
import Loader from '../../components/Loader';
import CustomSelect from '../../components/CustomSelect';
import Autocomplete from "react-google-autocomplete";
import { Country, State, City } from 'country-state-city';
import MapModal from '../../components/MapModal';

const COUNTRY_OPTIONS = [
    { value: '+91', label: '🇮🇳 +91' },
    { value: '+1', label: '🇺🇸 +1' },
    { value: '+44', label: '🇬🇧 +44' },
    { value: '+61', label: '🇦🇺 +61' },
    { value: '+971', label: '🇦🇪 +971' }
];

const DELIVERY_TIME_OPTIONS = [
    { value: 'same_day', label: 'Same Day' },
    { value: 'next_day', label: 'Next Day' },
    { value: 'custom', label: 'Custom Timing' }
];

const PremiumFileUpload = ({ fileId, label, onChange, previewData, onRemove, accept = "image/*, .pdf, .doc, .docx" }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleInternalChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            onChange({ target: { files: [file] } }, fileId);
        }, 1200);
    };

    const isImage = previewData && previewData.preview && previewData.preview.startsWith('data:image/');
    const isServerImage = previewData && previewData.preview && previewData.preview.startsWith('http');
    const displayImage = isImage || isServerImage;
    const fileName = previewData && previewData.fileObj ? previewData.fileObj.name : "Document.pdf";

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="premium-upload-card" style={{ flex: 1, width: '100%' }}>
                {!isUploading && !previewData?.preview && (
                    <input type="file" className="premium-upload-input" onChange={handleInternalChange} accept={accept} />
                )}

                {isUploading && (
                    <div className="shuffling-content">
                        <div className="shuffling-loader">
                            <div className="shuffling-card"></div>
                            <div className="shuffling-card"></div>
                            <div className="shuffling-card"></div>
                        </div>
                        <span className="shuffling-text">Authenticating & Uploading...</span>
                    </div>
                )}

                {!isUploading && !previewData?.preview && (
                    <div className="premium-upload-content">
                        <div className="upload-icon-wrapper">
                            <UploadCloud size={28} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: 'hsl(var(--primary))' }}>Click to Upload</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.2rem' }}>or drag and drop</p>
                        </div>
                    </div>
                )}

                {!isUploading && previewData?.preview && (
                    <div className="document-preview-container">
                        {displayImage ? (
                            <img src={previewData.preview} alt="preview" className="document-preview-image" />
                        ) : (
                            <div className="document-pdf-preview">
                                <File size={42} className="pdf-icon" />
                                <div className="document-filename" title={fileName}>{fileName}</div>
                            </div>
                        )}
                        <div className="document-preview-overlay">
                            <button type="button" onClick={(e) => { e.preventDefault(); onRemove(e, fileId); }}>
                                <Trash2 size={16} /> Remove Document
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const VendorProfile = () => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState(authStore.getState());
    const { user } = authState;
    const setUser = (user) => authStore.setUser(user);

    useEffect(() => {
        const unsubscribe = authStore.subscribe(setAuthState);
        return unsubscribe;
    }, []);

    const [activeTab, setActiveTab] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Drag-to-scroll for tab navbar
    const tabsRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragScrollLeft = useRef(0);

    const handleTabMouseDown = (e) => {
        isDragging.current = true;
        dragStartX.current = e.pageX - tabsRef.current.offsetLeft;
        dragScrollLeft.current = tabsRef.current.scrollLeft;
        tabsRef.current.style.cursor = 'grabbing';
    };
    const handleTabMouseLeaveOrUp = () => {
        isDragging.current = false;
        if (tabsRef.current) tabsRef.current.style.cursor = 'grab';
    };
    const handleTabMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - tabsRef.current.offsetLeft;
        const walk = (x - dragStartX.current) * 1.2;
        tabsRef.current.scrollLeft = dragScrollLeft.current - walk;
    };

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        ownerAddress: '',
        email: '',
        password: '',
        confirmPassword: '',
        countryCode: '+91',
        phone: '',
        alternateCountryCode: '+91',
        alternatePhone: '',
        status: 'draft',
        isKycDone: false,

        businessType: 'individual',
        registrationNumber: '',
        gstNumber: '',
        fssaiNumber: '',
        panNumber: '',
        yearsInBusiness: '',
        description: '',

        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        latitude: '',
        longitude: '',

        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',

        commissionPercentage: 0,
        minimumOrderAmount: '',
        deliveryRadiusKm: '',
        deliveryTime: 'same_day',
        selfDeliveryAvailable: false,
        platformDeliveryAvailable: true,
        codAvailable: true,
        returnsAccepted: false
    });

    const [files, setFiles] = useState({
        profileImage: null,
        gstCertificate: null,
        fssaiLicense: null,
        panCard: null,
        registrationCertificate: null,
        addressProof: null,
        vendorAgreement: null
    });

    const [previews, setPreviews] = useState({});
    const [customDocuments, setCustomDocuments] = useState([]);
    const [addressFocused, setAddressFocused] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const isDropdownShowing = addressFocused && formData.addressLine1?.length > 0;

    const countryOptions = Country.getAllCountries().map(c => ({ label: c.name, value: c.name, isoCode: c.isoCode }));
    const selectedCountry = countryOptions.find(c => c.value === formData.country);

    const stateOptions = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode).map(s => ({ label: s.name, value: s.name, isoCode: s.isoCode })) : [];
    const selectedState = stateOptions.find(s => s.value === formData.state);

    const cityOptions = selectedState ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode).map(c => ({ label: c.name, value: c.name })) : [];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(parseInt(tab));
    }, []);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await vendorService.getSelfVendor();
                if (response.success && response.data) {
                    const v = response.data;
                    setFormData({
                        businessName: v.businessName || '',
                        ownerName: v.ownerName || '',
                        ownerAddress: v.ownerAddress || '',
                        email: v.email || '',
                        password: '',
                        confirmPassword: '',
                        countryCode: v.countryCode || '+91',
                        phone: v.phone || '',
                        alternateCountryCode: v.alternateCountryCode || '+91',
                        alternatePhone: v.alternatePhone || '',
                        status: v.status || 'draft',
                        isKycDone: v.isKycDone || false,

                        businessType: v.businessDetails?.businessType || 'individual',
                        registrationNumber: v.businessDetails?.registrationNumber || '',
                        gstNumber: v.businessDetails?.gstNumber || '',
                        fssaiNumber: v.businessDetails?.fssaiNumber || '',
                        panNumber: v.businessDetails?.panNumber || '',
                        yearsInBusiness: v.businessDetails?.yearsInBusiness || '',
                        description: v.businessDetails?.description || '',

                        addressLine1: v.address?.addressLine1 || '',
                        addressLine2: v.address?.addressLine2 || '',
                        city: v.address?.city || '',
                        state: v.address?.state || '',
                        country: v.address?.country || 'India',
                        pincode: v.address?.pincode || '',
                        latitude: v.address?.location?.coordinates?.[1] || '',
                        longitude: v.address?.location?.coordinates?.[0] || '',

                        accountHolderName: v.bankDetails?.accountHolderName || '',
                        bankName: v.bankDetails?.bankName || '',
                        accountNumber: v.bankDetails?.accountNumber || '',
                        ifscCode: v.bankDetails?.ifscCode || '',
                        branchName: v.bankDetails?.branchName || '',

                        commissionPercentage: v.storeSettings?.commissionPercentage || 0,
                        minimumOrderAmount: v.storeSettings?.minimumOrderAmount || '',
                        deliveryRadiusKm: v.storeSettings?.deliveryRadiusKm || '',
                        deliveryTime: v.storeSettings?.deliveryTime || 'same_day',
                        selfDeliveryAvailable: v.storeSettings?.selfDeliveryAvailable || false,
                        platformDeliveryAvailable: v.storeSettings?.platformDeliveryAvailable || true,
                        codAvailable: v.storeSettings?.codAvailable || true,
                        returnsAccepted: v.storeSettings?.returnsAccepted || false
                    });

                    // Sync global user state with latest vendor data
                    setUser(prev => ({
                        ...prev,
                        isKycDone: v.isKycDone || false,
                        businessName: v.businessName || '',
                        profileImage: v.profileImage || null
                    }));

                    setCustomDocuments(v.customDocuments || []);

                    const existingPreviews = {};
                    if (v.profileImage) existingPreviews.profileImage = `${import.meta.env.VITE_IMAGE_API_URL}/${v.profileImage}`;
                    setPreviews(existingPreviews);
                }
            } catch (error) {
                toast.error(error.message || 'Failed to fetch vendor details');
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [fieldName]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
            };
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => ({ ...prev, [fieldName]: 'Document attached' }));
            }
        }
    };

    const removeImage = (e, fieldName) => {
        if (e) e.stopPropagation();
        setFiles(prev => ({ ...prev, [fieldName]: null }));
        setPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[fieldName];
            return newPreviews;
        });
    };

    const handleAddCustomDocument = () => {
        setCustomDocuments(prev => [...prev, { type: '', number: '', fileUrl: null, fileObj: null, preview: null }]);
    };

    const handleRemoveCustomDocument = (index) => {
        setCustomDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleCustomDocumentChange = (index, field, value) => {
        setCustomDocuments(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleCustomDocumentFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomDocuments(prev => {
                    const updated = [...prev];
                    updated[index].fileObj = file;
                    updated[index].preview = file.type.startsWith('image/') ? reader.result : 'Document attached';
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const extractLocationDetails = (components) => {
        let country = ''; let state = ''; let city = ''; let pincode = '';
        if (!components) return { country, state, city, pincode };

        for (const component of components) {
            const types = component.types;
            if (types.includes('country')) { country = component.long_name; }
            if (types.includes('administrative_area_level_1')) { state = component.long_name; }
            if (types.includes('locality')) { city = component.long_name; }
            else if (!city && types.includes('administrative_area_level_3')) { city = component.long_name; }
            else if (!city && types.includes('administrative_area_level_2')) { city = component.long_name; }
            if (types.includes('postal_code')) { pincode = component.long_name; }
        }
        return { country, state, city, pincode };
    };

    const handleLocationSelect = (extractedData) => {
        let matchedCountry = formData.country;
        let matchedState = formData.state;
        let matchedCity = '';

        if (extractedData.country) {
            const foundCountry = Country.getAllCountries().find(c => c.name.toLowerCase() === extractedData.country.toLowerCase() || c.isoCode === extractedData.country);
            if (foundCountry) matchedCountry = foundCountry.name;
        }

        if (extractedData.state && matchedCountry) {
            const countryObj = Country.getAllCountries().find(c => c.name === matchedCountry);
            if (countryObj) {
                const states = State.getStatesOfCountry(countryObj.isoCode);
                const foundState = states.find(s =>
                    s.name.toLowerCase() === extractedData.state.toLowerCase() ||
                    s.name.toLowerCase().includes(extractedData.state.toLowerCase()) ||
                    extractedData.state.toLowerCase().includes(s.name.toLowerCase())
                );
                if (foundState) matchedState = foundState.name;
            }
        }

        if (extractedData.city && matchedState && matchedCountry) {
            const countryObj = Country.getAllCountries().find(c => c.name === matchedCountry);
            const stateObj = State.getStatesOfCountry(countryObj?.isoCode).find(s => s.name === matchedState);
            if (countryObj && stateObj) {
                const cities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
                const foundCity = cities.find(c =>
                    c.name.toLowerCase() === extractedData.city.toLowerCase() ||
                    c.name.toLowerCase().includes(extractedData.city.toLowerCase()) ||
                    extractedData.city.toLowerCase().includes(c.name.toLowerCase())
                );
                if (foundCity) matchedCity = foundCity.name;
            }
        }

        setFormData(prev => ({
            ...prev,
            latitude: extractedData.lat || prev.latitude,
            longitude: extractedData.lng || prev.longitude,
            addressLine1: extractedData.addressLine1 || prev.addressLine1,
            country: matchedCountry || prev.country,
            state: matchedState || prev.state,
            city: matchedCity || prev.city,
            pincode: extractedData.pincode || prev.pincode
        }));
    };

    const handleKycVerification = async () => {
        try {
            setSubmitting(true);
            const kycPayload = {
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                branchName: formData.branchName
            };
            
            const response = await vendorService.verifyKyc(kycPayload);
            if (response.success) {
                toast.success('Bank Details Verified via Razorpay!');
                setFormData(prev => ({ ...prev, isKycDone: true }));
                
                // CRITICAL: Update global user state so Dashboard alert disappears
                setUser(prev => ({ ...prev, isKycDone: true }));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to verify KYC details.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveAndProceed = async (targetTab) => {
        try {
            setSubmitting(true);
            const payload = new FormData();

            if (formData.password && formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                setSubmitting(false);
                return;
            }

            if (formData.password) {
                payload.append('password', formData.password);
            }

            payload.append('businessName', formData.businessName);
            payload.append('ownerName', formData.ownerName);
            payload.append('ownerAddress', formData.ownerAddress);
            payload.append('email', formData.email);
            payload.append('countryCode', formData.countryCode);
            payload.append('phone', formData.phone);
            payload.append('alternateCountryCode', formData.alternateCountryCode);
            payload.append('alternatePhone', formData.alternatePhone);
            payload.append('status', formData.status);

            const businessDetails = {
                businessType: formData.businessType,
                registrationNumber: formData.registrationNumber,
                gstNumber: formData.gstNumber,
                fssaiNumber: formData.fssaiNumber,
                panNumber: formData.panNumber,
                yearsInBusiness: formData.yearsInBusiness,
                description: formData.description
            };
            payload.append('businessDetails', JSON.stringify(businessDetails));

            const address = {
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pincode: formData.pincode,
                location: {
                    type: "Point",
                    coordinates: [parseFloat(formData.longitude) || 0, parseFloat(formData.latitude) || 0]
                }
            };
            payload.append('address', JSON.stringify(address));

            const bankDetails = {
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                branchName: formData.branchName
            };
            payload.append('bankDetails', JSON.stringify(bankDetails));

            const storeSettings = {
                commissionPercentage: formData.commissionPercentage,
                minimumOrderAmount: formData.minimumOrderAmount,
                deliveryRadiusKm: formData.deliveryRadiusKm,
                deliveryTime: formData.deliveryTime,
                selfDeliveryAvailable: formData.selfDeliveryAvailable,
                platformDeliveryAvailable: formData.platformDeliveryAvailable,
                codAvailable: formData.codAvailable,
                returnsAccepted: formData.returnsAccepted
            };
            payload.append('storeSettings', JSON.stringify(storeSettings));

            Object.keys(files).forEach(key => {
                if (files[key]) {
                    payload.append(key, files[key]);
                }
            });

            customDocuments.forEach((doc, index) => {
                if (doc.type) payload.append(`customDocuments[${index}][type]`, doc.type);
                if (doc.number) payload.append(`customDocuments[${index}][number]`, doc.number);
                if (doc.fileObj) {
                    payload.append(`customDocuments[${index}][file]`, doc.fileObj);
                }
            });

            const response = await vendorService.updateSelfVendor(payload);

            if (response.success) {
                if (targetTab === 'submit') {
                    toast.success('Profile configuration saved successfully');

                    // Update user context if image changed
                    if (response.data && response.data.profileImage) {
                        setUser(prev => ({
                            ...prev,
                            name: response.data.businessName || response.data.name,
                            profileImage: response.data.profileImage
                        }));
                    }
                } else {
                    toast.success('Section saved successfully');
                    setActiveTab(targetTab);
                }

                if (formData.password) {
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                }
            }
        } catch (error) {
            toast.error(error.message || `Failed to update vendor config`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader message="Initializing Vendor Profile..." />;
    }

    return (
        <div className="profile-page-container fade-in">
            <div className="profile-content-pane">
                <header className="profile-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <button className="profile-btn-icon" onClick={() => navigate(-1)} title="Back">
                                <ArrowLeft size={16} />
                            </button>
                            <h1>My Business Profile</h1>
                        </div>
                        <p>Update and maintain your complex business identity parameters here.</p>
                    </div>
                </header>

                {!formData.isKycDone && (
                    <div style={{ padding: '15px 20px', background: 'hsl(var(--destructive) / 0.1)', borderLeft: '4px solid hsl(var(--destructive))', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'hsl(var(--destructive))' }}>
                        <Shield size={24} />
                        <div>
                            <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Action Required: KYC Pending</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                                Your Banking KYC is incomplete. Please navigate to the <b>Banking Matrix</b> tab, fill in your bank details, and verify them via Razorpay to receive payouts and accept orders.
                            </p>
                        </div>
                    </div>
                )}

                <div className="profile-layout-grid" style={{ alignItems: 'flex-start' }}>
                    {/* Identity Card (Left side similar to Super Admin) */}
                    <div className="profile-glass-card identity-card">
                        <div className="identity-header">
                            <div className="profile-avatar-large">
                                {previews.profileImage ? (
                                    <img src={previews.profileImage} alt="Profile" className="avatar-img-large" />
                                ) : (
                                    <User size={48} />
                                )}
                                <label className="avatar-edit-btn" htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
                                    <Camera size={14} />
                                </label>
                                <input
                                    type="file"
                                    id="profile-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'profileImage')}
                                />
                            </div>
                            {previews.profileImage && (
                                <button className="delete-image-btn" onClick={(e) => removeImage(e, 'profileImage')}>
                                    Remove Photo
                                </button>
                            )}
                            <div className="identity-details">
                                <h2>{formData.businessName || user?.name}</h2>
                                <div className="role-tag">
                                    <Shield size={12} />
                                    Vendor
                                </div>
                            </div>
                        </div>
                        <div className="identity-stats">
                            <div className="stat-item">
                                <span className="stat-label">Member Since</span>
                                <span className="stat-value">Feb 2026</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Last Login</span>
                                <span className="stat-value">Today</span>
                            </div>
                        </div>
                        <div className="identity-stats" style={{ marginTop: '1rem', borderTop: '1px solid hsl(var(--border) / 0.3)', paddingTop: '1rem' }}>
                            <div className="stat-item" style={{ width: '100%', alignItems: 'flex-start' }}>
                                <span className="stat-label" style={{ marginBottom: '0.5rem' }}>Update Status</span>
                                <button className="primary-button" onClick={() => handleSaveAndProceed('submit')} disabled={submitting} style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={18} /> {submitting ? 'Updating...' : 'Save All Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Card (Right side, containing AddVendor tabs) */}
                    <div className="profile-glass-card form-card employee-form-view">
                        <div
                            ref={tabsRef}
                            className="profile-tabs-scroll-wrapper"
                            style={{ marginBottom: '2rem', borderBottom: '1px solid hsl(var(--border) / 0.3)', cursor: 'grab' }}
                            onMouseDown={handleTabMouseDown}
                            onMouseLeave={handleTabMouseLeaveOrUp}
                            onMouseUp={handleTabMouseLeaveOrUp}
                            onMouseMove={handleTabMouseMove}
                        >
                            <div className="product-tab-navbar" style={{ background: 'transparent', padding: 0 }}>
                                <div className={`tab-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}><User size={16} /> 1. Basic Details</div>
                                <div className={`tab-nav-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}><Building2 size={16} /> 2. Business Details</div>
                                <div className={`tab-nav-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}><Landmark size={16} /> 3. Banking Matrix</div>
                                <div className={`tab-nav-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}><Box size={16} /> 4. Store Config</div>
                                <div className={`tab-nav-item ${activeTab === 5 ? 'active' : ''}`} onClick={() => setActiveTab(5)}><Layers size={16} /> 5. Documents</div>
                            </div>
                        </div>

                        <div className="employee-form-container animate-in fade-in" style={{ padding: '0.5rem 0' }}>
                            {activeTab === 1 && (
                                <div className="employee-form-grid" style={{ gap: '1.5rem' }}>
                                    <div className="employee-form-group">
                                        <label>Business Name</label>
                                        <input name="businessName" className="enterprise-input" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Apex Supplies Ltd" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Owner Name</label>
                                        <input name="ownerName" className="enterprise-input" value={formData.ownerName} onChange={handleInputChange} placeholder="Full Name" />
                                    </div>

                                    <div className="employee-form-group">
                                        <label>Email Address</label>
                                        <input name="email" type="email" className="enterprise-input" value={formData.email} onChange={handleInputChange} placeholder="vendor@example.com" disabled />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Mobile Number</label>
                                        <div className="phone-input-row" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ width: '130px', flexShrink: 0 }}>
                                                <CustomSelect
                                                    options={COUNTRY_OPTIONS}
                                                    value={formData.countryCode}
                                                    onChange={(val) => setFormData(prev => ({ ...prev, countryCode: val }))}
                                                    placeholder="Code"
                                                />
                                            </div>
                                            <input name="phone" className="enterprise-input" value={formData.phone} onChange={handleInputChange} placeholder="98765 43210" maxLength="10" style={{ flex: 1 }} />
                                        </div>
                                    </div>

                                    <div className="employee-form-group">
                                        <label>Password <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Leave blank to keep same)</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="password" type={showPassword ? "text" : "password"} className="enterprise-input" value={formData.password} onChange={handleInputChange} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex' }}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="enterprise-input" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex' }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="employee-form-group">
                                        <label>Alternative Mobile Number</label>
                                        <div className="phone-input-row" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ width: '130px', flexShrink: 0 }}>
                                                <CustomSelect
                                                    options={COUNTRY_OPTIONS}
                                                    value={formData.alternateCountryCode}
                                                    onChange={(val) => setFormData(prev => ({ ...prev, alternateCountryCode: val }))}
                                                    placeholder="Code"
                                                />
                                            </div>
                                            <input name="alternatePhone" className="enterprise-input" value={formData.alternatePhone} onChange={handleInputChange} placeholder="Optional Backup Number" maxLength="10" style={{ flex: 1 }} />
                                        </div>
                                    </div>

                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Owner Address</label>
                                        <textarea name="ownerAddress" className="enterprise-input" value={formData.ownerAddress} onChange={handleInputChange} placeholder="Full residential address..." rows={2} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 2 && (
                                <div className="employee-form-grid">
                                    <div className="employee-form-group">
                                        <label>Business Type</label>
                                        <CustomSelect
                                            options={[
                                                { value: 'individual', label: 'Individual / Sole Proprietorship' },
                                                { value: 'partnership', label: 'Partnership' },
                                                { value: 'pvt_ltd', label: 'Private Limited (Pvt Ltd)' },
                                                { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
                                            ]}
                                            value={formData.businessType}
                                            onChange={(val) => handleInputChange({ target: { name: 'businessType', value: val } })}
                                            placeholder="Select Business Type"
                                        />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Registration Number <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <input name="registrationNumber" className="enterprise-input" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Company Reg No." />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>GST Identification Number <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <input name="gstNumber" className="enterprise-input" value={formData.gstNumber} onChange={handleInputChange} placeholder="29ABCDE1234F1Z5" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>FSSAI License Number <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <input name="fssaiNumber" className="enterprise-input" value={formData.fssaiNumber} onChange={handleInputChange} placeholder="FSSAI Code" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>PAN Number <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <input name="panNumber" className="enterprise-input" value={formData.panNumber} onChange={handleInputChange} placeholder="ABCDE1234F" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Years in Business <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <input type="number" min="0" onKeyDown={(e) => e.key === '-' && e.preventDefault()} onWheel={(e) => e.target.blur()} name="yearsInBusiness" className="enterprise-input" value={formData.yearsInBusiness} onChange={handleInputChange} placeholder="e.g. 5" />
                                    </div>
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Business Description <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Optional)</span></label>
                                        <textarea name="description" className="enterprise-input" value={formData.description} onChange={handleInputChange} placeholder="Overview of goods/services..." rows={2} />
                                    </div>

                                    <div className="employee-form-group geo-header-row" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Geographical Coordinates</h4>
                                        <button type="button" onClick={() => setIsMapModalOpen(true)} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            <MapPin size={14} /> Open Interactive Map
                                        </button>
                                    </div>

                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Search Address / Location</label>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <Autocomplete
                                                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                                onPlaceSelected={(place) => {
                                                    if (place && place.geometry && place.geometry.location) {
                                                        const extracted = extractLocationDetails(place.address_components);
                                                        handleLocationSelect({
                                                            lat: place.geometry.location.lat(),
                                                            lng: place.geometry.location.lng(),
                                                            addressLine1: place.formatted_address || place.name,
                                                            ...extracted
                                                        });
                                                        toast.success("Location mapped and dropdowns updated!");
                                                    }
                                                }}
                                                options={{
                                                    types: ["geocode", "establishment"],
                                                }}
                                                className="enterprise-input location-autocomplete"
                                                placeholder="Type to search and pin location automatically..."
                                                value={formData.addressLine1}
                                                onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                                                onFocus={() => setAddressFocused(true)}
                                                onBlur={() => setTimeout(() => setAddressFocused(false), 200)}
                                            />

                                            {addressFocused && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 4px)',
                                                    left: 0,
                                                    right: 0,
                                                    background: 'hsl(var(--background))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderBottom: isDropdownShowing ? 'none' : '1px solid hsl(var(--border))',
                                                    borderRadius: isDropdownShowing ? '0.5rem 0.5rem 0 0' : '0.5rem',
                                                    zIndex: 100002,
                                                    overflow: 'hidden',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    boxShadow: isDropdownShowing ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                                                }}>
                                                    <div
                                                        onClick={() => setIsMapModalOpen(true)}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '0 1rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            cursor: 'pointer',
                                                            color: 'hsl(var(--primary))',
                                                            fontWeight: 600,
                                                            backgroundColor: 'hsl(var(--primary) / 0.05)',
                                                            borderBottom: isDropdownShowing ? '1px solid hsl(var(--border) / 0.3)' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.1)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.05)'}
                                                    >
                                                        <div style={{ background: 'hsl(var(--primary) / 0.15)', padding: '0.3rem', borderRadius: '50%', display: 'flex' }}>
                                                            <MapPin size={16} />
                                                        </div>
                                                        Select location on Map
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Address Line 2 (Optional Details)</label>
                                        <input name="addressLine2" className="enterprise-input" value={formData.addressLine2} onChange={handleInputChange} placeholder="Flat, Floor, Building Name, Landmark" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Country</label>
                                        <CustomSelect
                                            options={countryOptions}
                                            value={formData.country}
                                            onChange={(val) => setFormData(prev => ({ ...prev, country: val, state: '', city: '' }))}
                                            placeholder="Select Country"
                                        />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>State</label>
                                        <CustomSelect
                                            options={stateOptions}
                                            value={formData.state}
                                            onChange={(val) => setFormData(prev => ({ ...prev, state: val, city: '' }))}
                                            placeholder="Select State"
                                        />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>City</label>
                                        <CustomSelect
                                            options={cityOptions}
                                            value={formData.city}
                                            onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                                            placeholder="Select City"
                                        />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Pincode</label>
                                        <input name="pincode" className="enterprise-input" value={formData.pincode} onChange={handleInputChange} placeholder="Postal Code" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Latitude</label>
                                        <input name="latitude" type="number" onWheel={(e) => e.target.blur()} step="0.0000001" className="enterprise-input" value={formData.latitude} onChange={handleInputChange} placeholder="e.g. 28.7041" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Longitude</label>
                                        <input name="longitude" type="number" onWheel={(e) => e.target.blur()} step="0.0000001" className="enterprise-input" value={formData.longitude} onChange={handleInputChange} placeholder="e.g. 77.1025" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 3 && (
                                <div className="employee-form-grid">
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'hsl(var(--foreground))', fontWeight: 700 }}>Banking & Settlement Details</h3>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Manage your beneficiary account for automated payouts.</p>
                                        </div>

                                        {formData.isKycDone ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'hsl(var(--success)/0.15)', color: 'hsl(var(--success))', padding: '6px 14px', borderRadius: '30px', fontWeight: '600', fontSize: '0.85rem' }}>
                                                <Shield size={16} /> Verified ✓
                                            </div>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={handleKycVerification} 
                                                disabled={submitting || !formData.accountHolderName || !formData.accountNumber || !formData.ifscCode}
                                                style={{ padding: '8px 16px', background: 'hsl(var(--primary))', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: (submitting || !formData.accountHolderName) ? 'not-allowed' : 'pointer', opacity: (submitting || !formData.accountHolderName) ? 0.7 : 1 }}
                                            >
                                                {submitting ? 'Verifying...' : 'Verify Bank Details'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Beneficiary Account Name</label>
                                        <input name="accountHolderName" className="enterprise-input" value={formData.accountHolderName} onChange={handleInputChange} placeholder="Exact Name Linked to Account" disabled={formData.isKycDone} />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Bank Name</label>
                                        <input name="bankName" className="enterprise-input" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. HDFC Bank" disabled={formData.isKycDone} />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Account Number</label>
                                        <input name="accountNumber" className="enterprise-input" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account No." disabled={formData.isKycDone} />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>IFSC Code</label>
                                        <input name="ifscCode" className="enterprise-input" value={formData.ifscCode} onChange={handleInputChange} placeholder="Routing/Swift/IFSC" disabled={formData.isKycDone} />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Branch Name</label>
                                        <input name="branchName" className="enterprise-input" value={formData.branchName} onChange={handleInputChange} placeholder="Branch Locale" disabled={formData.isKycDone} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 4 && (
                                <div className="employee-form-grid">
                                    <div className="employee-form-group">
                                        <label>Minimum Order Amount (₹)</label>
                                        <input name="minimumOrderAmount" min="0" type="number" onKeyDown={(e) => e.key === '-' && e.preventDefault()} onWheel={(e) => e.target.blur()} className="enterprise-input" value={formData.minimumOrderAmount} onChange={handleInputChange} placeholder="100" />
                                    </div>
                                    <div className="employee-form-group">
                                        <label>Delivery Radius (Km)</label>
                                        <input name="deliveryRadiusKm" min="0" type="number" onKeyDown={(e) => e.key === '-' && e.preventDefault()} onWheel={(e) => e.target.blur()} step="0.1" className="enterprise-input" value={formData.deliveryRadiusKm} onChange={handleInputChange} placeholder="e.g. 15.5" />
                                    </div>
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Expected Delivery Time</label>
                                        <CustomSelect
                                            options={DELIVERY_TIME_OPTIONS}
                                            value={formData.deliveryTime}
                                            onChange={(val) => setFormData(prev => ({ ...prev, deliveryTime: val }))}
                                            placeholder="Select Delivery Time"
                                        />
                                    </div>

                                    <div className="employee-form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem' }}>
                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Self Delivery Available</span>
                                            <label className="premium-toggle">
                                                <input name="selfDeliveryAvailable" type="checkbox" className="premium-toggle-input" checked={formData.selfDeliveryAvailable} onChange={handleInputChange} />
                                                <span className="premium-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="employee-form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem' }}>
                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Platform Delivery Included</span>
                                            <label className="premium-toggle">
                                                <input name="platformDeliveryAvailable" type="checkbox" className="premium-toggle-input" checked={formData.platformDeliveryAvailable} onChange={handleInputChange} />
                                                <span className="premium-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="employee-form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem' }}>
                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>COD Available</span>
                                            <label className="premium-toggle">
                                                <input name="codAvailable" type="checkbox" className="premium-toggle-input" checked={formData.codAvailable} onChange={handleInputChange} />
                                                <span className="premium-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="employee-form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem' }}>
                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Returns Accepted</span>
                                            <label className="premium-toggle">
                                                <input name="returnsAccepted" type="checkbox" className="premium-toggle-input" checked={formData.returnsAccepted} onChange={handleInputChange} />
                                                <span className="premium-toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 5 && (
                                <div className="employee-form-grid" style={{ gap: '1.5rem' }}>
                                    <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ background: 'hsl(var(--primary) / 0.05)', padding: '1rem', borderRadius: '1rem', border: '1px dashed hsl(var(--primary) / 0.3)' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                                                <strong style={{ color: 'hsl(var(--primary))' }}>Attachment Vault:</strong> Please upload official, high-resolution color copies of all relevant certificates.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="vendor-docs-grid">
                                        {[
                                            { key: 'gstCertificate', label: 'GST Certificate' },
                                            { key: 'fssaiLicense', label: 'FSSAI License' },
                                            { key: 'panCard', label: 'PAN Card Copy' },
                                            { key: 'registrationCertificate', label: 'Business Registration / Incorporation' },
                                            { key: 'addressProof', label: 'Physical Address Proof' },
                                            { key: 'vendorAgreement', label: 'Signed Vendor E-Agreement' }
                                        ].map((doc) => (
                                            <div className="employee-form-group" key={doc.key} style={{ background: 'hsl(var(--card))', padding: '1.2rem', borderRadius: '1rem', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '0.8rem', color: 'hsl(var(--foreground))' }}>
                                                    <FileText size={16} className="text-primary" /> {doc.label}
                                                </label>
                                                <PremiumFileUpload
                                                    fileId={doc.key}
                                                    onChange={(e, id) => handleFileChange(e, id)}
                                                    previewData={{ preview: previews[doc.key], fileObj: files[doc.key] }}
                                                    onRemove={(e, id) => removeImage(e, id)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Layers size={18} /> Additional / Custom Documents
                                            </h4>
                                            <button type="button" onClick={handleAddCustomDocument} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                                <Plus size={16} /> Add Document
                                            </button>
                                        </div>

                                        {customDocuments.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', background: 'hsl(var(--secondary) / 0.2)', borderRadius: '1rem', border: '1px dashed hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                                                No additional documents added. Click "Add Document" to upload custom certificates.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {customDocuments.map((doc, index) => (
                                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'hsl(var(--card))', padding: '1.5rem', borderRadius: '1.2rem', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' }}>

                                                        <button type="button" onClick={() => handleRemoveCustomDocument(index)} className="destructive-button" style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', padding: '0.6rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }} title="Remove Document Entry">
                                                            <Trash2 size={16} />
                                                        </button>

                                                        <div className="custom-doc-fields-grid">
                                                            <div className="employee-form-group">
                                                                <label>Document Name / Type</label>
                                                                <input type="text" className="enterprise-input" placeholder="e.g. MSME Certificate" value={doc.type || ''} onChange={(e) => handleCustomDocumentChange(index, 'type', e.target.value)} />
                                                            </div>

                                                            <div className="employee-form-group">
                                                                <label>Document Number (Optional)</label>
                                                                <input type="text" className="enterprise-input" placeholder="e.g. DOC-12345" value={doc.number || ''} onChange={(e) => handleCustomDocumentChange(index, 'number', e.target.value)} />
                                                            </div>
                                                        </div>

                                                        <div className="employee-form-group" style={{ marginTop: '0.5rem' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '0.8rem', color: 'hsl(var(--foreground))' }}>
                                                                <FileText size={16} className="text-primary" /> Upload Assigned Document File
                                                            </label>
                                                            <PremiumFileUpload
                                                                fileId={index}
                                                                onChange={(e, id) => handleCustomDocumentFileChange(id, e)}
                                                                previewData={{ preview: doc.preview, fileObj: doc.fileObj }}
                                                                onRemove={(e, id) => {
                                                                    e.stopPropagation();
                                                                    handleCustomDocumentChange(id, 'fileObj', null);
                                                                    handleCustomDocumentChange(id, 'preview', null);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                initialAddress={formData.addressLine1}
                onConfirm={(locationData) => {
                    handleLocationSelect({
                        lat: locationData.latitude,
                        lng: locationData.longitude,
                        addressLine1: locationData.addressLine1,
                        country: locationData.country,
                        state: locationData.state,
                        city: locationData.city,
                        pincode: locationData.pincode
                    });
                    toast.success("Address & Geography imported from Map!");
                }}
            />

            {submitting && <Loader message="Updating Secure Profile..." />}
        </div>
    );
};

export default VendorProfile;

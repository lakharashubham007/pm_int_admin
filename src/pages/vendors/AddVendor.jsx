import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import roleService from '../../services/roleService';
import {
    ArrowLeft, Save, Building2, Landmark, User, Zap, Box, Layers, Image as ImageIcon, FileText, ChevronRight, ChevronLeft, MapPin, X, RefreshCw, Plus, Trash2, UploadCloud, File, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../employee/Employee.css';
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
        // Simulate a network upload "shuffling" animation to wow the user
        setTimeout(() => {
            setIsUploading(false);
            // Create a synthetic-like event to prevent react pooling/nullification issues
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

const AddVendor = ({ isSelfProfile = false }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const [vendorId, setVendorId] = useState(paramId || null);
    const isEdit = !!vendorId || isSelfProfile;

    const [activeTab, setActiveTab] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(!!paramId || isSelfProfile);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        roleId: '',
        status: 'draft',

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
    const [roles, setRoles] = useState([]);
    const [addressFocused, setAddressFocused] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const isDropdownShowing = addressFocused && formData.addressLine1?.length > 0;

    const countryOptions = Country.getAllCountries().map(c => ({ label: c.name, value: c.name, isoCode: c.isoCode }));
    const selectedCountry = countryOptions.find(c => c.value === formData.country);

    const stateOptions = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode).map(s => ({ label: s.name, value: s.name, isoCode: s.isoCode })) : [];
    const selectedState = stateOptions.find(s => s.value === formData.state);

    const cityOptions = selectedState ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode).map(c => ({ label: c.name, value: c.name })) : [];

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await roleService.getRoles();
                setRoles(data);
                if (!paramId) {
                    const vendorRole = data.find(r => r.name.toLowerCase() === 'vendor');
                    if (vendorRole) {
                        setFormData(prev => ({ ...prev, roleId: vendorRole._id }));
                    }
                }
            } catch (error) {
                console.error('Failed to load roles', error);
            }
        };
        fetchRoles();
    }, [paramId]);

    useEffect(() => {
        if (paramId || isSelfProfile) {
            const fetchVendor = async () => {
                try {
                    const response = isSelfProfile
                        ? await vendorService.getSelfVendor()
                        : await vendorService.getVendorById(paramId);
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

                        setCustomDocuments(v.customDocuments || []);

                        const existingPreviews = {};
                        if (v.profileImage) existingPreviews.profileImage = `${import.meta.env.VITE_IMAGE_API_URL}/${v.profileImage}`;
                        setPreviews(existingPreviews);
                    }
                } catch (error) {
                    toast.error(error.message || 'Failed to fetch vendor details');
                    navigate('/vendors/list-vendors');
                } finally {
                    setLoading(false);
                }
            };
            fetchVendor();
        }
    }, [paramId, navigate]);

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

    // --- Custom Documents Handlers ---
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
    // ---------------------------------

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                toast.success("Location pinned successfully!");
            }, function (error) {
                toast.error("Failed to acquire location. Please enter manually.");
            });
        } else {
            toast.error("Geolocation is not supported by your browser.");
        }
    };

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

    const handleSaveAndProceed = async (targetTab) => {
        try {
            // Validate Basic Details if creating for the first time
            if (!vendorId && !isSelfProfile) {
                if (!formData.businessName || !formData.email || !formData.password) {
                    toast.error("Business Name, Email, and Password are required to start registration");
                    return;
                }
            }

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
            if (formData.roleId) payload.append('roleId', formData.roleId);
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

            // Append custom documents to payload
            customDocuments.forEach((doc, index) => {
                if (doc.type) payload.append(`customDocuments[${index}][type]`, doc.type);
                if (doc.number) payload.append(`customDocuments[${index}][number]`, doc.number);
                if (doc.fileObj) {
                    payload.append(`customDocuments[${index}][file]`, doc.fileObj);
                }
            });

            let response;
            if (isSelfProfile) {
                response = await vendorService.updateSelfVendor(payload);
            } else if (vendorId) {
                response = await vendorService.updateVendor(vendorId, payload);
            } else {
                response = await vendorService.createVendor(payload);
            }

            if (response.success) {
                if (!vendorId && response.data && response.data._id && !isSelfProfile) {
                    setVendorId(response.data._id);
                }

                if (targetTab === 'submit') {
                    toast.success(isSelfProfile ? 'Profile configuration saved successfully' : (isEdit ? 'Vendor profile synchronized' : 'Vendor created successfully'));
                    if (!isSelfProfile) {
                        navigate('/vendors/list-vendors');
                    }
                } else {
                    toast.success('Draft saved successfully');
                    setActiveTab(targetTab);
                }

                // Clear password fields after success to avoid resending unless typed
                if (formData.password) {
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                }
            }
        } catch (error) {
            toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} vendor config`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader message="Intializing Vendor Blueprint..." />;
    }

    return (
        <div className="employee-page-container fade-in">
            <div className="employee-content-pane employee-form-view">
                <header className="employee-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {!isSelfProfile && (
                                <button className="employee-btn-icon" onClick={() => navigate('/vendors/list-vendors')} title="Back to list">
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                            <h1>{isSelfProfile ? 'My Business Profile' : (isEdit ? 'Revise Vendor Architecture' : 'Establish Vendor Entity')}</h1>
                        </div>
                        <p>{isSelfProfile ? 'Update and maintain your complex business identity parameters here.' : (isEdit ? `Modifying intelligence for ${formData.businessName}` : 'Configure a new supply chain entity across 5 stages.')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="secondary-button" onClick={() => navigate('/vendors/list-vendors')}>Discard</button>
                        <button className="primary-button" onClick={() => handleSaveAndProceed('submit')} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> {submitting ? 'Executing...' : (isEdit ? 'Save & Exit' : 'Initialize & Exit')}
                        </button>
                    </div>
                </header>

                <div className="employee-glass-card">
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid hsl(var(--border) / 0.3)' }}>
                        <div className="product-tab-navbar" style={{ minWidth: 'max-content', background: 'transparent', padding: 0 }}>
                            <div className={`tab-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => !vendorId ? toast.error("Please save Basic Details first") : setActiveTab(1)}><User size={16} /> 1. Basic Details</div>
                            <div className={`tab-nav-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => !vendorId ? toast.error("Please save Basic Details first") : setActiveTab(2)}><Building2 size={16} /> 2. Business Details</div>
                            <div className={`tab-nav-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => !vendorId ? toast.error("Please save Basic Details first") : setActiveTab(3)}><Landmark size={16} /> 3. Banking Matrix</div>
                            <div className={`tab-nav-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => !vendorId ? toast.error("Please save Basic Details first") : setActiveTab(4)}><Box size={16} /> 4. Store Config</div>
                            <div className={`tab-nav-item ${activeTab === 5 ? 'active' : ''}`} onClick={() => !vendorId ? toast.error("Please save Basic Details first") : setActiveTab(5)}><Layers size={16} /> 5. Documents</div>
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
                                    <input name="email" type="email" className="enterprise-input" value={formData.email} onChange={handleInputChange} placeholder="vendor@example.com" />
                                </div>
                                <div className="employee-form-group">
                                    <label>Mobile Number</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                                    <label>Password {isEdit && <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'hsl(var(--muted-foreground))' }}>(Leave blank to keep same)</span>}</label>
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
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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

                                {!isSelfProfile && (
                                    <div className="employee-form-group">
                                        <label>Role</label>
                                        <CustomSelect
                                            options={roles.map(r => ({ value: r._id, label: r.name }))}
                                            value={formData.roleId}
                                            onChange={(val) => setFormData(prev => ({ ...prev, roleId: val }))}
                                            placeholder="Select Role"
                                        />
                                    </div>
                                )}

                                <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Owner Address</label>
                                    <textarea name="ownerAddress" className="enterprise-input" value={formData.ownerAddress} onChange={handleInputChange} placeholder="Full residential address..." rows={2} />
                                </div>

                                {/* Profile Image Upload Area */}
                                <div className="employee-form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                    <PremiumFileUpload
                                        fileId="profileImage"
                                        label="Profile Photo (Displayed on Vendor Dashboard)"
                                        onChange={(e, id) => handleFileChange(e, id)}
                                        previewData={{ preview: previews.profileImage, fileObj: files.profileImage }}
                                        onRemove={(e, id) => removeImage(e, id)}
                                        accept="image/jpeg, image/png, image/webp"
                                    />
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

                                <div className="employee-form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
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
                                    <style>{`
                                        .location-autocomplete:focus {
                                            border-color: hsl(var(--primary));
                                            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
                                        }
                                        .pac-container {
                                            border-radius: ${isDropdownShowing ? '0 0 0.5rem 0.5rem' : '0.5rem'} !important;
                                            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                                            border: 1px solid hsl(var(--border)) !important;
                                            border-top: ${isDropdownShowing ? 'none' : '1px solid hsl(var(--border))'} !important;
                                            font-family: inherit !important;
                                            margin-top: ${isDropdownShowing ? '52px' : '4px'} !important;
                                            z-index: 999999 !important;
                                        }
                                        .pac-item {
                                            padding: 0.6rem 1rem !important;
                                            cursor: pointer !important;
                                            border-top: 1px solid hsl(var(--border) / 0.3) !important;
                                            font-size: 0.9rem !important;
                                            display: flex !important;
                                            align-items: center !important;
                                        }
                                        .pac-item:hover {
                                            background-color: hsl(var(--secondary) / 0.5) !important;
                                        }
                                        .pac-item-query {
                                            color: hsl(var(--foreground)) !important;
                                            font-weight: 600 !important;
                                            padding-right: 0.3rem !important;
                                        }
                                        .pac-icon {
                                            margin-right: 0.8rem !important;
                                        }
                                    `}</style>
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
                                <div className="employee-form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Beneficiary Account Name</label>
                                    <input name="accountHolderName" className="enterprise-input" value={formData.accountHolderName} onChange={handleInputChange} placeholder="Exact Name Linked to Account" />
                                </div>
                                <div className="employee-form-group">
                                    <label>Bank Name</label>
                                    <input name="bankName" className="enterprise-input" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. HDFC Bank" />
                                </div>
                                <div className="employee-form-group">
                                    <label>Account Number</label>
                                    <input name="accountNumber" className="enterprise-input" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account No." />
                                </div>
                                <div className="employee-form-group">
                                    <label>IFSC Code</label>
                                    <input name="ifscCode" className="enterprise-input" value={formData.ifscCode} onChange={handleInputChange} placeholder="Routing/Swift/IFSC" />
                                </div>
                                <div className="employee-form-group">
                                    <label>Branch Name</label>
                                    <input name="branchName" className="enterprise-input" value={formData.branchName} onChange={handleInputChange} placeholder="Branch Locale" />
                                </div>
                            </div>
                        )}

                        {activeTab === 4 && (
                            <div className="employee-form-grid">
                                <div className="employee-form-group">
                                    <label>Minimum Order Amount (₹)</label>
                                    <input name="minimumOrderAmount" min="0" onKeyDown={(e) => e.key === '-' && e.preventDefault()} onWheel={(e) => e.target.blur()} type="number" className="enterprise-input" value={formData.minimumOrderAmount} onChange={handleInputChange} placeholder="100" />
                                </div>
                                <div className="employee-form-group">
                                    <label>Delivery Radius (Km)</label>
                                    <input name="deliveryRadiusKm" min="0" onKeyDown={(e) => e.key === '-' && e.preventDefault()} onWheel={(e) => e.target.blur()} type="number" step="0.1" className="enterprise-input" value={formData.deliveryRadiusKm} onChange={handleInputChange} placeholder="e.g. 15.5" />
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem', transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)'}>
                                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Self Delivery Available</span>
                                        <label className="premium-toggle">
                                            <input name="selfDeliveryAvailable" type="checkbox" className="premium-toggle-input" checked={formData.selfDeliveryAvailable} onChange={handleInputChange} />
                                            <span className="premium-toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="employee-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem', transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)'}>
                                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Platform Delivery Included</span>
                                        <label className="premium-toggle">
                                            <input name="platformDeliveryAvailable" type="checkbox" className="premium-toggle-input" checked={formData.platformDeliveryAvailable} onChange={handleInputChange} />
                                            <span className="premium-toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="employee-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem', transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)'}>
                                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>COD Available</span>
                                        <label className="premium-toggle">
                                            <input name="codAvailable" type="checkbox" className="premium-toggle-input" checked={formData.codAvailable} onChange={handleInputChange} />
                                            <span className="premium-toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="employee-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.8rem 1rem', background: 'hsl(var(--secondary) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: '0.75rem', transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)'}>
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

                                {/* Pre-defined Standard Documents */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', gridColumn: '1 / -1' }}>
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

                                {/* Custom Dynamic Documents Section */}
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

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingRight: '4rem' }}>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
                        <button className="secondary-button" onClick={() => setActiveTab(prev => Math.max(1, prev - 1))} disabled={activeTab === 1} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: activeTab === 1 ? 0.4 : 1 }}>
                            <ChevronLeft size={16} /> Previous Section
                        </button>

                        <button className="primary-button" onClick={() => handleSaveAndProceed(activeTab < 5 ? activeTab + 1 : 'submit')} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {activeTab < 5 ? (<>Save & Proceed Next <ChevronRight size={16} /></>) : (<><Save size={16} /> Finalize & Commit</>)}
                        </button>
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

            {submitting && <Loader message={isEdit ? "Synchronizing Revisions..." : "Executing Vendor Initialization..."} />}
        </div>
    );
};

export default AddVendor;

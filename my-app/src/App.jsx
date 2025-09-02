import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, Calendar, Image, Loader, CheckCircle, XCircle, Trash2, Globe } from 'lucide-react';


// API Base URL
const API_BASE = 'http://localhost:5000/api';

// Supported OCR Languages
const OCR_LANGUAGES = [
    { code: 'eng', name: 'English', flag: '🇺🇸' },
    { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fra', name: 'French', flag: '🇫🇷' },
    { code: 'deu', name: 'German', flag: '🇩🇪' },
    { code: 'ita', name: 'Italian', flag: '🇮🇹' },
    { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'rus', name: 'Russian', flag: '🇷🇺' },
    { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'chi_tra', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
    { code: 'kor', name: 'Korean', flag: '🇰🇷' },
    { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ben', name: 'Bengali', flag: '🇧🇩' },
    { code: 'tha', name: 'Thai', flag: '🇹🇭' },
    { code: 'vie', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'nld', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pol', name: 'Polish', flag: '🇵🇱' },
    { code: 'tur', name: 'Turkish', flag: '🇹🇷' },
    { code: 'swe', name: 'Swedish', flag: '🇸🇪' },
];

// Utility function for API calls
const api = {
    uploadImage: async (formData) => {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    },

    getRecords: async (search = '') => {
        const url = search ? `${API_BASE}/records?search=${encodeURIComponent(search)}` : `${API_BASE}/records`;
        const response = await fetch(url);
        return response.json();
    },

    deleteRecord: async (id) => {
        const response = await fetch(`${API_BASE}/records/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    }
};

// Notification Component
const Notification = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse`}>
            <Icon size={20} />
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
                ×
            </button>
        </div>
    );
};

// Home Component - Image Upload and OCR
const Home = ({ onNotification }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('eng');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setExtractedText('');

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            onNotification('error', 'Please select an image first');
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('language', selectedLanguage);

        try {
            const result = await api.uploadImage(formData);

            if (result.success) {
                setExtractedText(result.record.extractedText);
                onNotification('success', 'Image processed and saved successfully!');
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onNotification('error', `Upload failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreview(null);
        setExtractedText('');
        setSelectedLanguage('eng');
        setShowLanguageDropdown(false);
    };

    const selectedLangObj = OCR_LANGUAGES.find(lang => lang.code === selectedLanguage);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <FileText className="mx-auto mb-4 text-blue-600" size={64} />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">OCR Text Extractor</h1>
                    <p className="text-gray-600">Upload an image to extract text using OCR technology</p>
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                    <label className="block w-full text-sm font-medium text-gray-700 mb-2">
                        OCR Language
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                            className="w-full sm:w-auto flex items-center justify-between space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <Globe size={20} className="text-gray-500" />
                                <span className="text-lg">{selectedLangObj?.flag}</span>
                                <span className="font-medium text-gray-700">{selectedLangObj?.name}</span>
                            </div>
                            <span className="text-gray-400">▼</span>
                        </button>

                        {showLanguageDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                {OCR_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLanguage(lang.code);
                                            setShowLanguageDropdown(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors ${selectedLanguage === lang.code ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="font-medium">{lang.name}</span>
                                        {selectedLanguage === lang.code && (
                                            <CheckCircle size={16} className="ml-auto text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* File Upload Area */}
                <div className="mb-8">
                    <label className="block w-full">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            {preview ? (
                                <div className="space-y-4">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mx-auto max-h-64 rounded-lg shadow-md"
                                    />
                                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload className="mx-auto text-gray-400" size={48} />
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">Click to upload an image</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isProcessing}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FileText size={20} />
                                <span>Extract Text</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={resetForm}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {/* Extracted Text Display */}
                {extractedText && (
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                            <FileText size={20} />
                            <span>Extracted Text</span>
                        </h3>
                        <div className="bg-white rounded-lg p-4 border">
                            <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                                {extractedText || 'No text extracted from the image.'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Records Component - Display all records with search
const Records = ({ onNotification }) => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filteredRecords, setFilteredRecords] = useState([]);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        // Filter records based on search term
        if (searchTerm.trim() === '') {
            setFilteredRecords(records);
        } else {
            const filtered = records.filter(record =>
                record.extractedText.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRecords(filtered);
        }
    }, [searchTerm, records]);

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            const result = await api.getRecords();

            if (result.success) {
                setRecords(result.records);
            } else {
                throw new Error(result.error || 'Failed to fetch records');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            onNotification('error', 'Failed to load records');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const result = await api.deleteRecord(id);

            if (result.success) {
                setRecords(records.filter(record => record._id !== id));
                onNotification('success', 'Record deleted successfully');
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            onNotification('error', 'Failed to delete record');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                    <p className="text-gray-600">Loading records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">OCR Records</h1>

                {/* Search Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search extracted text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {searchTerm && (
                        <p className="mt-3 text-sm text-gray-600">
                            Found {filteredRecords.length} record(s) matching "{searchTerm}"
                        </p>
                    )}
                </div>
            </div>

            {/* Records Grid */}
            {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                        {searchTerm ? 'No matching records found' : 'No records yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try a different search term' : 'Upload your first image to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecords.map((record) => (
                        <div
                            key={record._id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            {/* Image Preview */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={`${API_BASE.replace('/api', '')}${record.imageUrl}`}
                                    alt="OCR Source"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={() => handleDelete(record._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                        title="Delete record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                {/* Extracted Text */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                                        <FileText size={16} />
                                        <span>Extracted Text</span>
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {record.extractedText.length > 150
                                                ? `${record.extractedText.substring(0, 150)}...`
                                                : record.extractedText || 'No text extracted'}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar size={14} />
                                        <span>{formatDate(record.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FileText size={14} />
                                        <span>{record.extractedText.length} chars</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main App Component
const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText className="text-blue-600" size={32} />
                            <h1 className="text-xl font-bold text-gray-800">OCR System</h1>
                        </div>

                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage('home')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 'home'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Upload size={16} />
                                    <span>Upload</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setCurrentPage('records')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 'records'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText size={16} />
                                    <span>Records</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-8">
                {currentPage === 'home' ? (
                    <Home onNotification={showNotification} />
                ) : (
                    <Records onNotification={showNotification} />
                )}
            </main>

            {/* Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={closeNotification}
                />
            )}
        </div>
    );
};

export default App;
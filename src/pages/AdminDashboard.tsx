import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, Profile } from '../hooks/useProfile';
import { Search, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, UploadCloud, Book, FileText, RefreshCw } from 'lucide-react';
import { Loading } from '../components/Loading';

interface Publication {
    id: number;
    title: string;
    authors: string;
    journal: string;
    year: number;
    url: string;
    type: string;
    file_path?: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { profile, loading: profileLoading } = useProfile();
    const [activeTab, setActiveTab] = useState<'profile' | 'publications' | 'teaching' | 'gallery'>('profile');
    const [formData, setFormData] = useState<Partial<Profile>>({});

    const [publications, setPublications] = useState<Publication[]>([]);
    const [searchPub, setSearchPub] = useState('');

    const [teaching, setTeaching] = useState<any[]>([]);
    const [newCourse, setNewCourse] = useState({ course_name: '', program: '', year: '' });

    const [gallery, setGallery] = useState<any[]>([]);
    const [newGalleryImage, setNewGalleryImage] = useState<File | null>(null);
    const [newGalleryCaption, setNewGalleryCaption] = useState('');
    const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
    const [editingGalleryCaption, setEditingGalleryCaption] = useState('');
    const galleryFileInputRef = useRef<HTMLInputElement>(null);

    // Modals & Toasts
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [deleteModal, setDeleteModal] = useState<number | null>(null);
    const [deleteCourseModal, setDeleteCourseModal] = useState<number | null>(null);
    const [deleteGalleryModal, setDeleteGalleryModal] = useState<number | null>(null); // holds publication ID
    const [editingPub, setEditingPub] = useState<Partial<Publication> | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileUploadFile, setProfileUploadFile] = useState<File | null>(null);
    const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
    const profileFileInputRef = useRef<HTMLInputElement>(null);

    const [logoUploadFile, setLogoUploadFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/secure-admin-login');
    }, [navigate]);

    const handleSyncScholar = async () => {
        const url = prompt('Enter Google Scholar Profile URL:', 'https://scholar.google.com/citations?user=WeV6fSYAAAAJ&hl=id');
        if (!url) return;

        setIsSyncing(true);
        showToast('Syncing with Google Scholar... This may take a moment.', 'success');

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/publications/sync-scholar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
            });
            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Synced successfully', 'success');
                loadPublications();
            } else {
                showToast(data.error || 'Failed to sync', 'error');
            }
        } catch (err) {
            showToast('Error syncing with Scholar', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile]);

    const loadPublications = async () => {
        try {
            const res = await fetch('/api/publications');
            const data = await res.json();
            setPublications(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load publications', 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 'publications') {
            loadPublications();
        } else if (activeTab === 'teaching') {
            loadTeaching();
        } else if (activeTab === 'gallery') {
            loadGallery();
        }
    }, [activeTab]);

    const loadGallery = async () => {
        try {
            const res = await fetch('/api/gallery');
            const data = await res.json();
            setGallery(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load gallery', 'error');
        }
    };

    const handleAddGallery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGalleryImage) return showToast('Please select an image', 'error');

        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('image', newGalleryImage);
        formData.append('caption', newGalleryCaption);

        try {
            const res = await fetch('/api/gallery', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                showToast('Image uploaded successfully', 'success');
                setNewGalleryImage(null);
                setNewGalleryCaption('');
                if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
                loadGallery();
            } else {
                showToast('Failed to upload image', 'error');
            }
        } catch (err) {
            showToast('Error uploading image', 'error');
        }
    };

    const confirmDeleteGallery = async (id: number) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Image deleted successfully', 'success');
                setDeleteGalleryModal(null);
                loadGallery();
            }
        } catch (err) {
            showToast('Failed to delete image', 'error');
        }
    };

    const handleEditGalleryCaption = async (id: number) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ caption: editingGalleryCaption })
            });
            if (res.ok) {
                showToast('Caption updated successfully', 'success');
                setEditingGalleryId(null);
                loadGallery();
            } else {
                showToast('Failed to update caption', 'error');
            }
        } catch (err) {
            showToast('Error updating caption', 'error');
        }
    };

    const loadTeaching = async () => {
        try {
            const res = await fetch('/api/teaching');
            const data = await res.json();
            setTeaching(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Failed to load teaching data', 'error');
        }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/teaching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newCourse)
            });
            if (res.ok) {
                showToast('Course added successfully', 'success');
                setNewCourse({ course_name: '', program: '', year: '' });
                loadTeaching();
            } else {
                showToast('Failed to add course', 'error');
            }
        } catch (err) {
            showToast('Error adding course', 'error');
        }
    };

    const confirmDeleteCourse = async (id: number) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/teaching/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Course deleted', 'success');
                setDeleteCourseModal(null);
                loadTeaching();
            } else {
                showToast('Failed to delete course', 'error');
            }
        } catch (err) {
            showToast('Error deleting course', 'error');
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/secure-admin-login');
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return showToast('New passwords do not match', 'error');
        }
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Password changed successfully', 'success');
                setChangePasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.error || 'Failed to change password', 'error');
            }
        } catch (err) {
            showToast('Error changing password', 'error');
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        try {
            const data = new FormData();
            if (formData.name) data.append('name', formData.name);
            if (formData.title) data.append('title', formData.title);
            if (formData.bio) data.append('bio', formData.bio);
            if (formData.email) data.append('email', formData.email);
            if (formData.scholar_url) data.append('scholar_url', formData.scholar_url);
            if (formData.researchgate_url) data.append('researchgate_url', formData.researchgate_url);
            if (formData.scopus_url) data.append('scopus_url', formData.scopus_url);
            if (formData.orcid_url) data.append('orcid_url', formData.orcid_url);
            if (formData.research_interests) data.append('research_interests', formData.research_interests);
            if (formData.photo_url && !profileUploadFile) data.append('photo_url', formData.photo_url);
            if (profileUploadFile) data.append('photo', profileUploadFile);
            if (formData.logo_url && !logoUploadFile) data.append('logo_url', formData.logo_url);
            if (logoUploadFile) data.append('logo', logoUploadFile);

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            if (res.ok) {
                const result = await res.json();
                if (result.photo_url) {
                    setFormData(prev => ({ ...prev, photo_url: result.photo_url }));
                }
                if (result.logo_url) {
                    setFormData(prev => ({ ...prev, logo_url: result.logo_url }));
                }
                setProfileUploadFile(null);
                setProfilePreviewUrl(null);
                setLogoUploadFile(null);
                setLogoPreviewUrl(null);
                showToast('Profile updated successfully', 'success');
            } else {
                showToast('Failed to update profile', 'error');
            }
        } catch (err) {
            showToast('Error updating profile', 'error');
        }
    };

    const handleProfilePhotoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        validateAndSetProfileImage(file);
    };

    const handleLogoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        validateAndSetLogoImage(file);
    };

    const validateAndSetProfileImage = (file: File | undefined) => {
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Only JPEG, PNG, or WEBP images are allowed', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size must be less than 2MB', 'error');
            return;
        }
        setProfileUploadFile(file);
        const objectUrl = URL.createObjectURL(file);
        setProfilePreviewUrl(objectUrl);
    };

    const validateAndSetLogoImage = (file: File | undefined) => {
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Only JPEG, PNG, or WEBP images are allowed', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size must be less than 2MB', 'error');
            return;
        }
        setLogoUploadFile(file);
        const objectUrl = URL.createObjectURL(file);
        setLogoPreviewUrl(objectUrl);
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
            setUploadFile(file);
        } else {
            showToast('Please select a valid PDF under 5MB', 'error');
        }
    };

    const handlePubSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        if (!editingPub) return;

        const isNew = !editingPub.id;
        const url = isNew ? '/api/publications' : `/api/publications/${editingPub.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const formData = new FormData();
        if (editingPub.title) formData.append('title', editingPub.title);
        if (editingPub.authors) formData.append('authors', editingPub.authors);
        if (editingPub.journal) formData.append('journal', editingPub.journal);
        if (editingPub.year) formData.append('year', editingPub.year.toString());
        if (editingPub.url) formData.append('url', editingPub.url);
        if (editingPub.type) formData.append('type', editingPub.type);
        if (uploadFile) formData.append('file', uploadFile);

        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            setUploadProgress(0);
            if (xhr.status >= 200 && xhr.status < 300) {
                showToast(`Publication ${isNew ? 'created' : 'updated'}`, 'success');
                setEditingPub(null);
                setUploadFile(null);
                loadPublications();
            } else {
                showToast('Failed to save publication', 'error');
            }
        };

        xhr.onerror = () => {
            setUploadProgress(0);
            showToast('An error occurred during upload', 'error');
        };

        xhr.send(formData);
    };

    const confirmDelete = async (id: number) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/publications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Publication deleted', 'success');
                setDeleteModal(null);
                loadPublications();
            } else {
                showToast('Failed to delete', 'error');
            }
        } catch (err) {
            showToast('Error deleting publication', 'error');
        }
    };

    if (profileLoading) return <Loading />;

    const filteredPubs = publications.filter(p => p.title?.toLowerCase().includes(searchPub.toLowerCase()) || p.authors?.toLowerCase().includes(searchPub.toLowerCase()));

    return (
        <div className="flex-grow bg-[#F4F7F6] min-h-screen relative font-sans">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-sm shadow-xl font-medium text-sm transition-all duration-300 transform translate-y-0 ${toast.type === 'success' ? 'bg-[#006633] text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Publication?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm">CANCEL</button>
                            <button onClick={() => confirmDelete(deleteModal)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Course Confirmation Modal */}
            {deleteCourseModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Course?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteCourseModal(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm">CANCEL</button>
                            <button onClick={() => confirmDeleteCourse(deleteCourseModal)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Gallery Confirmation Modal */}
            {deleteGalleryModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Image?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteGalleryModal(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm">CANCEL</button>
                            <button onClick={() => confirmDeleteGallery(deleteGalleryModal)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publication Form Modal */}
            {editingPub && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-2xl font-serif text-slate-800">{editingPub.id ? 'Edit Publication' : 'Add New Publication'}</h3>
                            <button onClick={() => setEditingPub(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handlePubSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                                    <input type="text" value={editingPub.title || ''} onChange={e => setEditingPub({ ...editingPub, title: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Authors</label>
                                    <input type="text" value={editingPub.authors || ''} onChange={e => setEditingPub({ ...editingPub, authors: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Journal / Publisher</label>
                                    <input type="text" value={editingPub.journal || ''} onChange={e => setEditingPub({ ...editingPub, journal: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                                    <input type="number" value={editingPub.year || new Date().getFullYear()} onChange={e => setEditingPub({ ...editingPub, year: parseInt(e.target.value) })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                    <select value={editingPub.type || 'journal'} onChange={e => setEditingPub({ ...editingPub, type: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none bg-white">
                                        <option value="journal">Journal</option>
                                        <option value="book">Book</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">External URL</label>
                                    <input type="url" value={editingPub.url || ''} onChange={e => setEditingPub({ ...editingPub, url: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" />
                                </div>
                                {/* File Upload Area */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Upload PDF File (Max 5MB)</label>
                                    <div
                                        className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${uploadFile ? 'border-[#006633] bg-emerald-50' : 'border-slate-300 hover:border-[#006633] bg-slate-50'}`}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
                                                    setUploadFile(file);
                                                } else if (file) {
                                                    showToast('Please select a valid PDF under 5MB', 'error');
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <UploadCloud size={32} className={`mx-auto mb-2 ${uploadFile ? 'text-[#006633]' : 'text-slate-400'}`} />
                                        {uploadFile ? (
                                            <p className="text-sm font-semibold text-[#006633]">{uploadFile.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm text-slate-600 font-medium mb-1">Click to browse or drag and drop</p>
                                                <p className="text-xs text-slate-400">PDF files only</p>
                                                {editingPub.file_path && <p className="text-xs font-bold text-[#006633] mt-2">Current file: {editingPub.file_path.split('/').pop()}</p>}
                                            </>
                                        )}
                                    </div>

                                    {uploadProgress > 0 && (
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                                            <div className="bg-[#006633] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => { setEditingPub(null); setUploadFile(null); }} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-sm uppercase tracking-wider">Cancel</button>
                                <button type="submit" disabled={uploadProgress > 0} className="px-5 py-2.5 bg-[#006633] text-white text-sm font-bold rounded-sm hover:bg-[#008844] uppercase tracking-wider shadow-md disabled:opacity-50">
                                    {uploadProgress > 0 ? 'Uploading...' : 'Save Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {changePasswordModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl max-w-sm w-full p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Change Password</h3>
                        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm outline-none focus:border-[#006633]" required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm outline-none focus:border-[#006633]" required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-sm outline-none focus:border-[#006633]" required />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => { setChangePasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#006633] text-white text-xs font-bold rounded-sm hover:bg-[#008844] uppercase tracking-wider">Save Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-emerald-800/10 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <h1 className="text-2xl font-serif text-slate-900 border-l-4 border-[#006633] pl-3">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <a href="/" className="text-[11px] font-bold text-slate-400 hover:text-[#006633] uppercase tracking-[0.15em] transition-colors">View Site</a>
                    <span className="w-px h-4 bg-slate-300 mx-2"></span>
                    <button onClick={() => setChangePasswordModal(true)} className="text-[11px] font-bold text-slate-600 hover:text-[#006633] uppercase tracking-[0.15em] transition-colors">Change Password</button>
                    <button onClick={handleLogout} className="text-[11px] font-bold text-red-600 border border-red-200 px-4 py-2 rounded-sm hover:bg-red-50 uppercase tracking-[0.15em] transition-colors">Logout</button>
                </div>
            </header>

            <div className="p-6 lg:p-10 max-w-5xl mx-auto">
                <div className="flex gap-6 mb-8 border-b border-slate-200">
                    <button
                        className={`pb-3 border-b-2 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'profile' ? 'text-[#006633] border-[#006633]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Data
                    </button>
                    <button
                        className={`pb-3 border-b-2 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'publications' ? 'text-[#006633] border-[#006633]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => setActiveTab('publications')}
                    >
                        Publications
                    </button>
                    <button
                        className={`pb-3 border-b-2 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'teaching' ? 'text-[#006633] border-[#006633]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => setActiveTab('teaching')}
                    >
                        Teaching
                    </button>
                    <button
                        className={`pb-3 border-b-2 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'gallery' ? 'text-[#006633] border-[#006633]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        onClick={() => setActiveTab('gallery')}
                    >
                        Gallery
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-sm">
                        <h2 className="text-2xl font-serif text-slate-800 mb-8 border-b border-emerald-800/10 pb-3">Edit Profile Identity</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                                    <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                                    <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Google Scholar URL</label>
                                    <input type="url" value={formData.scholar_url || ''} onChange={e => setFormData({ ...formData, scholar_url: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">ResearchGate URL</label>
                                    <input type="url" value={formData.researchgate_url || ''} onChange={e => setFormData({ ...formData, researchgate_url: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Scopus URL</label>
                                    <input type="url" value={formData.scopus_url || ''} onChange={e => setFormData({ ...formData, scopus_url: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">ORCID URL</label>
                                    <input type="url" value={formData.orcid_url || ''} onChange={e => setFormData({ ...formData, orcid_url: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Research Interests (Comma separated tags)</label>
                                    <input type="text" value={formData.research_interests || ''} onChange={e => setFormData({ ...formData, research_interests: e.target.value })} placeholder="Curriculum Development, Educational Philosophy" className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Profile Photo (Max 2MB)</label>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 shrink-0 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center">
                                            {profilePreviewUrl || formData.photo_url ? (
                                                <img src={profilePreviewUrl || formData.photo_url || ''} alt="Profile preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-slate-400 text-xs text-center px-2">No Image</span>
                                            )}
                                        </div>
                                        <div
                                            className={`flex-grow border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${profileUploadFile ? 'border-[#006633] bg-emerald-50' : 'border-slate-300 hover:border-[#006633] bg-slate-50'}`}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={handleProfilePhotoDrop}
                                            onClick={() => profileFileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                accept="image/jpeg, image/png, image/webp"
                                                ref={profileFileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    validateAndSetProfileImage(file);
                                                }}
                                                className="hidden"
                                            />
                                            <UploadCloud size={24} className={`mx-auto mb-2 ${profileUploadFile ? 'text-[#006633]' : 'text-slate-400'}`} />
                                            {profileUploadFile ? (
                                                <p className="text-sm font-semibold text-[#006633]">{profileUploadFile.name}</p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-600 font-medium mb-1">Click to browse or drag and drop image</p>
                                                    <p className="text-xs text-slate-400">JPEG, PNG, or WEBP (Max 2MB). External URL can still be used if left empty.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Or use External Image URL</label>
                                        <input type="url" value={formData.photo_url || ''} onChange={e => { setFormData({ ...formData, photo_url: e.target.value }); setProfilePreviewUrl(null); setProfileUploadFile(null); }} placeholder="https://example.com/photo.jpg" className="w-full p-2.5 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none placeholder:text-slate-400" />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">University / Organization Logo (Max 2MB)</label>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 shrink-0 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center bg-white p-2">
                                            {logoPreviewUrl || formData.logo_url ? (
                                                <img src={logoPreviewUrl || formData.logo_url || ''} alt="Logo preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-xs text-center px-2">No Logo</span>
                                            )}
                                        </div>
                                        <div
                                            className={`flex-grow border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${logoUploadFile ? 'border-[#006633] bg-emerald-50' : 'border-slate-300 hover:border-[#006633] bg-slate-50'}`}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={handleLogoDrop}
                                            onClick={() => logoFileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                accept="image/jpeg, image/png, image/webp"
                                                ref={logoFileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    validateAndSetLogoImage(file);
                                                }}
                                                className="hidden"
                                            />
                                            <UploadCloud size={24} className={`mx-auto mb-2 ${logoUploadFile ? 'text-[#006633]' : 'text-slate-400'}`} />
                                            {logoUploadFile ? (
                                                <p className="text-sm font-semibold text-[#006633]">{logoUploadFile.name}</p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-600 font-medium mb-1">Click to browse or drag and drop logo</p>
                                                    <p className="text-xs text-slate-400">JPEG, PNG, or WEBP (Max 2MB). External URL can still be used if left empty.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Or use External Logo URL</label>
                                        <input type="url" value={formData.logo_url || ''} onChange={e => { setFormData({ ...formData, logo_url: e.target.value }); setLogoPreviewUrl(null); setLogoUploadFile(null); }} placeholder="https://example.com/logo.jpg" className="w-full p-2.5 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none placeholder:text-slate-400" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-yellow-50/50 p-4 border border-yellow-100 rounded-sm text-xs text-yellow-800">
                                    <strong className="block mb-1">Theme Update Notice:</strong>
                                    The UI uses UIN Cirebon Emerald Green theme (#006633). Keep external URLs valid to ensure proper Academic Badges rendering.
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biography Data</label>
                                    <textarea value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={8} className="w-full p-3 text-sm border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-[#006633] outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6">
                                <button type="submit" className="bg-[#006633] text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#008844] transition-colors rounded-sm shadow-md">Update Profile</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'publications' && (
                    <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-800/10 pb-6 mb-8 gap-4">
                            <h2 className="text-2xl font-serif text-slate-800">Manage Publications</h2>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-grow sm:flex-none">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Search..." value={searchPub} onChange={(e) => setSearchPub(e.target.value)} className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" />
                                </div>
                                <button onClick={handleSyncScholar} disabled={isSyncing} className={`shrink-0 flex items-center gap-2 ${isSyncing ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'} text-white px-4 py-2 text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-sm`}>
                                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Sync Scholar'}
                                </button>
                                <button onClick={() => { setEditingPub({ year: new Date().getFullYear(), type: 'journal' }); setUploadFile(null); setUploadProgress(0); }} className="shrink-0 flex items-center gap-2 bg-[#006633] hover:bg-[#008844] text-white px-4 py-2 text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-sm">
                                    <Plus size={16} /> Add New
                                </button>
                            </div>
                        </div>

                        {filteredPubs.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-sm border border-slate-100">
                                No publications found. Click "Add New" to create one.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredPubs.map(pub => (
                                    <div key={pub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-200 hover:border-[#006633]/40 hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 rounded-sm gap-4">
                                        <div className="flex-grow min-w-0 pr-4">
                                            <h4 className="font-bold text-slate-800 text-base line-clamp-1">{pub.title}</h4>
                                            {pub.authors && <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{pub.authors}</p>}
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                                                {pub.type === 'book' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm font-semibold uppercase tracking-wider">
                                                        <Book size={12} /> Book
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-[#006633] border border-emerald-200 rounded-sm font-semibold uppercase tracking-wider">
                                                        <FileText size={12} /> Journal
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>{pub.year}</span>
                                                {pub.journal && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{pub.journal}</span>
                                                    </>
                                                )}
                                                {pub.file_path && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="inline-flex items-center gap-0.5 text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm border border-red-100">PDF</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => { setEditingPub(pub); setUploadFile(null); setUploadProgress(0); }} className="p-2 text-slate-400 hover:text-[#006633] hover:bg-emerald-50 rounded transition-colors" title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => setDeleteModal(pub.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'teaching' && (
                    <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-sm">
                        <div className="border-b border-emerald-800/10 pb-6 mb-8">
                            <h2 className="text-2xl font-serif text-slate-800">Manage Teaching & Courses</h2>
                        </div>

                        <form onSubmit={handleAddCourse} className="mb-10 bg-slate-50 p-6 border border-slate-200 rounded-sm">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Add New Course</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input type="text" placeholder="Course Name" value={newCourse.course_name} onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })} className="flex-grow p-3 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                <input type="text" placeholder="Program (e.g. Undergrad)" value={newCourse.program} onChange={e => setNewCourse({ ...newCourse, program: e.target.value })} className="w-full sm:w-48 p-3 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                <input type="text" placeholder="Year/Semester" value={newCourse.year} onChange={e => setNewCourse({ ...newCourse, year: e.target.value })} className="w-full sm:w-40 p-3 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" required />
                                <button type="submit" className="px-6 py-3 bg-[#006633] text-white text-xs font-bold rounded-sm hover:bg-[#008844] uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap">
                                    Add Course
                                </button>
                            </div>
                        </form>

                        {teaching.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-sm border border-slate-100">
                                No teaching data found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {teaching.map(course => (
                                    <div key={course.id} className="flex justify-between items-center p-4 border border-slate-200 hover:border-[#006633]/30 hover:shadow-sm transition-all rounded-sm gap-4">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-800 text-base">{course.course_name}</h4>
                                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                <span className="font-medium">{course.program}</span>
                                                <span>•</span>
                                                <span className="font-medium text-[#006633]">{course.year}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setDeleteCourseModal(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-sm">
                        <div className="border-b border-emerald-800/10 pb-6 mb-8">
                            <h2 className="text-2xl font-serif text-slate-800">Manage Gallery Images</h2>
                        </div>

                        <form onSubmit={handleAddGallery} className="mb-10 bg-slate-50 p-6 border border-slate-200 rounded-sm">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Add New Image</h3>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <input type="file" accept="image/*" ref={galleryFileInputRef} onChange={e => setNewGalleryImage(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#006633] file:text-white hover:file:bg-[#008844] cursor-pointer" required />
                                <input type="text" placeholder="Caption (optional)" value={newGalleryCaption} onChange={e => setNewGalleryCaption(e.target.value)} className="w-full sm:w-1/2 p-3 text-sm border border-slate-300 rounded-sm focus:border-[#006633] outline-none" />
                                <button type="submit" className="px-6 py-3 bg-[#006633] text-white text-xs font-bold rounded-sm hover:bg-[#008844] uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap">
                                    Upload
                                </button>
                            </div>
                        </form>

                        {gallery.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-sm border border-slate-100">
                                No gallery images found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {gallery.map(img => (
                                    <div key={img.id} className="border border-slate-200 rounded-sm overflow-hidden group">
                                        <div className="relative h-40">
                                            <img src={img.image_url} alt={img.caption || 'Gallery image'} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button onClick={() => { setEditingGalleryId(img.id); setEditingGalleryCaption(img.caption || ''); }} className="p-2 text-white hover:text-blue-400 transition-colors" title="Edit Caption">
                                                    <Edit2 size={24} />
                                                </button>
                                                <button onClick={() => setDeleteGalleryModal(img.id)} className="p-2 text-white hover:text-red-400 transition-colors" title="Delete">
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                                            {editingGalleryId === img.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <input type="text" value={editingGalleryCaption} onChange={(e) => setEditingGalleryCaption(e.target.value)} className="w-full p-2 text-xs border border-slate-300 rounded-sm focus:border-[#006633] outline-none" autoFocus />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setEditingGalleryId(null)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                                        <button onClick={() => handleEditGalleryCaption(img.id)} className="text-[10px] uppercase font-bold text-[#006633] hover:text-[#008844]">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-600 truncate">{img.caption || <span className="italic text-slate-400">No caption</span>}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

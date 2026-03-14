import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit3, Trash2, X, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import cmsService from '../../services/cmsService';
import Loader from '../../components/Loader';

const FAQTab = () => {
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        status: true,
        order: 0
    });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setIsLoading(true);
        try {
            const data = await cmsService.getFAQs();
            setFaqs(data || []);
        } catch (error) {
            toast.error('Failed to load FAQs');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete FAQ?',
            text: 'Are you sure you want to delete this frequently asked question?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(var(--destructive))',
            cancelButtonColor: 'hsl(var(--secondary))',
            confirmButtonText: 'Yes, Delete',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                await cmsService.deleteFAQ(id);
                toast.success('FAQ removed successfully');
                fetchFAQs();
            } catch (error) {
                toast.error('Deletion failed');
                setIsLoading(false);
            }
        }
    };

    const openModal = (faq = null) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                status: faq.status,
                order: faq.order
            });
        } else {
            setEditingFaq(null);
            setFormData({
                question: '',
                answer: '',
                status: true,
                order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 1
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
    };

    const handleSave = async () => {
        if (!formData.question.trim() || !formData.answer.trim()) {
            toast.error('Question and Answer are required!');
            return;
        }

        setIsSaving(true);
        try {
            if (editingFaq) {
                await cmsService.updateFAQ(editingFaq._id, formData);
                toast.success('FAQ updated successfully');
            } else {
                await cmsService.createFAQ(formData);
                toast.success('FAQ created successfully');
            }
            closeModal();
            fetchFAQs();
        } catch (error) {
            toast.error(editingFaq ? 'Failed to update FAQ' : 'Failed to create FAQ');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="cms-tab-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Manage FAQs</h2>
                <button className="primary-button" onClick={() => openModal()}>
                    <Plus size={16} /> <span style={{ marginLeft: '0.5rem' }}>Add FAQ</span>
                </button>
            </div>

            {isLoading ? (
                <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Loader /></div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="cms-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Order</th>
                                <th>Question</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faqs.length > 0 ? faqs.map((faq) => (
                                <tr key={faq._id}>
                                    <td style={{ fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>{faq.order}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{faq.question}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px', maxWidth: '600px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {faq.answer}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            backgroundColor: faq.status ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                                            color: faq.status ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'
                                        }}>
                                            {faq.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                className="secondary-button"
                                                style={{ padding: '6px' }}
                                                onClick={() => openModal(faq)}
                                                title="Edit FAQ"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="secondary-button"
                                                style={{ padding: '6px', color: 'hsl(var(--destructive))' }}
                                                onClick={() => handleDelete(faq._id)}
                                                title="Delete FAQ"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                        No FAQs found. Create your first FAQ!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* In-tab Modal for FAQ Edit/Create */}
            {isModalOpen && createPortal(
                <div
                    className="cms-modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="cms-modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                                {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="cms-form-group">
                            <label>Question</label>
                            <input
                                type="text"
                                className="cms-input"
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                placeholder="e.g. How do I reset my password?"
                            />
                        </div>

                        <div className="cms-form-group">
                            <label>Answer</label>
                            <textarea
                                className="cms-input"
                                rows={4}
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Provide the answer here..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="cms-form-group">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    className="cms-input"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="cms-form-group">
                                <label>Status</label>
                                <div className="cms-status-toggle">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <span style={{ fontSize: '0.9rem', color: formData.status ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                                        {formData.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="secondary-button" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="primary-button" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                <span style={{ marginLeft: '0.5rem' }}>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FAQTab;

"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams } from "next/navigation";

interface Court {
    id: string;
    name: string;
    sport_type: string;
    price_per_hour: number;
    image_url?: string;
}

export default function CourtsPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [venueId, setVenueId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        sport_type: "Futsal",
        price_per_hour: 0,
        image_url: ""
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch Venue ID and Courts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get Venue ID for this owner
                let { data: venueData, error: venueError } = await supabase
                    .from('venues')
                    .select('id')
                    .eq('owner_id', userId)
                    .maybeSingle();

                if (venueError) {
                    console.error("Error fetching venue:", venueError);
                }

                // If no venue found, create one automatically
                if (!venueData) {
                    console.log("No venue found, creating default venue...");
                    const { data: newVenue, error: createError } = await supabase
                        .from('venues')
                        .insert({
                            owner_id: userId,
                            name: "My Venue",
                            address: "Please update address",
                            facilities: ["Parking"]
                        })
                        .select('id')
                        .single();

                    if (createError) {
                        console.error("Error creating venue:", createError);
                    } else {
                        venueData = newVenue;
                    }
                }

                if (venueData) {
                    setVenueId(venueData.id);

                    // 2. Get Courts
                    const { data: courtsData, error: courtsError } = await supabase
                        .from('courts')
                        .select('*')
                        .eq('venue_id', venueData.id)
                        .order('name');

                    if (courtsError) throw courtsError;
                    setCourts(courtsData || []);

                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleOpenModal = (court?: Court) => {
        if (court) {
            setEditingCourt(court);
            setFormData({
                name: court.name,
                sport_type: court.sport_type,
                price_per_hour: court.price_per_hour,
                image_url: court.image_url || ""
            });
        } else {
            setEditingCourt(null);
            setFormData({
                name: "",
                sport_type: "Futsal",
                price_per_hour: 0,
                image_url: ""
            });
        }
        setIsModalOpen(true);
        setSelectedFile(null);
        setPreviewUrl(court?.image_url || null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('court-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('court-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image: " + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueId) {
            alert("Error: No venue profile found. Please refresh the page to generate one.");
            return;
        }

        setSaving(true);
        try {
            let finalImageUrl = formData.image_url;

            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                } else {
                    setSaving(false);
                    return; // Stop if upload failed
                }
            }

            if (editingCourt) {
                // Update
                const { error } = await supabase
                    .from('courts')
                    .update({
                        name: formData.name,
                        sport_type: formData.sport_type,
                        price_per_hour: formData.price_per_hour,
                        image_url: finalImageUrl
                    })
                    .eq('id', editingCourt.id);

                if (error) throw error;

                // Update local state
                setCourts(courts.map(c => c.id === editingCourt.id ? { ...c, ...formData, image_url: finalImageUrl } : c));
            } else {
                // Create
                const { data, error } = await supabase
                    .from('courts')
                    .insert({
                        venue_id: venueId,
                        name: formData.name,
                        sport_type: formData.sport_type,
                        price_per_hour: formData.price_per_hour,
                        image_url: finalImageUrl
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Update local state
                setCourts([...courts, data]);
            }

            setIsModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error: any) {
            console.error("Error saving court:", error);
            alert("Failed to save court: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this court?")) return;

        try {
            const { error } = await supabase
                .from('courts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCourts(courts.filter(c => c.id !== id));
        } catch (error: any) {
            console.error("Error deleting court:", error);
            alert("Failed to delete court: " + error.message);
        }
    };

    return (
        <div className="courts-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Court Management</h1>
                    <p>Manage your courts, fields, and pricing with precision.</p>
                </div>
                <Button variant="primary" className="add-btn" onClick={() => handleOpenModal()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add New Court
                </Button>
            </header>

            <div className="courts-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Loading your courts...</p>
                    </div>
                ) : courts.length === 0 ? (
                    <div className="empty-state-premium">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <h3>No Courts Found</h3>
                        <p>Start by adding your first court or field to begin accepting bookings.</p>
                        <Button variant="primary" style={{ marginTop: '1.5rem' }} onClick={() => handleOpenModal()}>Add Your First Court</Button>
                    </div>
                ) : (
                    courts.map(court => (
                        <div key={court.id} className="court-card-premium">
                            <div className="court-image-wrapper">
                                <img
                                    src={court.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"}
                                    alt={court.name}
                                />
                                <div className="sport-tag">{court.sport_type}</div>
                            </div>
                            <div className="court-info-premium">
                                <div className="court-main-info">
                                    <h3>{court.name}</h3>
                                    <div className="court-price-tag">
                                        <span className="currency">RM</span>
                                        <span className="amount">{court.price_per_hour}</span>
                                        <span className="period">/hr</span>
                                    </div>
                                </div>
                                <div className="court-actions-premium">
                                    <button className="action-btn edit" onClick={() => handleOpenModal(court)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Edit
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(court.id)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <Card className="modal-content-premium" variant="glass">
                        <div className="modal-header">
                            <h2>{editingCourt ? "Edit Court Details" : "Register New Court"}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave} className="premium-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Court Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Center Court A"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sport Type</label>
                                    <select
                                        value={formData.sport_type}
                                        onChange={e => setFormData({ ...formData, sport_type: e.target.value })}
                                    >
                                        <option value="Futsal">Futsal</option>
                                        <option value="Football">Football</option>
                                        <option value="Badminton">Badminton</option>
                                        <option value="Tennis">Tennis</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hourly Rate (RM)</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">RM</span>
                                        <input
                                            type="number"
                                            value={formData.price_per_hour}
                                            onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Court Image</label>
                                    <div className="image-upload-area">
                                        {previewUrl ? (
                                            <div className="image-preview-container">
                                                <img src={previewUrl} alt="Preview" className="image-preview" />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(null);
                                                        setFormData({ ...formData, image_url: "" });
                                                    }}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="upload-placeholder">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <div className="upload-icon">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                </div>
                                                <span>Click to upload image</span>
                                                <p>JPG, PNG or WEBP (Max 5MB)</p>
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Image URL (Optional fallback)</label>
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={saving || uploading}>
                                    {saving || uploading ? (
                                        <>
                                            <span className="btn-loader"></span>
                                            {uploading ? "Uploading..." : "Saving..."}
                                        </>
                                    ) : editingCourt ? "Update Court" : "Create Court"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <style jsx>{`
                .courts-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    padding-bottom: 3rem;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .page-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }
                .add-btn {
                    height: 50px;
                    padding: 0 1.5rem;
                    font-weight: 700;
                    border-radius: 12px;
                }
                .courts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                }
                .court-card-premium {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    flex-direction: column;
                }
                .court-card-premium:hover {
                    transform: translateY(-10px);
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(0, 158, 96, 0.3);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }
                .court-image-wrapper {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }
                .court-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }
                .court-card-premium:hover .court-image-wrapper img {
                    transform: scale(1.1);
                }
                .sport-tag {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    color: var(--primary);
                    padding: 0.4rem 1rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border: 1px solid rgba(0, 158, 96, 0.3);
                }
                .court-info-premium {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    flex-grow: 1;
                }
                .court-main-info h3 {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #fff;
                    margin-bottom: 0.75rem;
                }
                .court-price-tag {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                }
                .court-price-tag .currency {
                    font-size: 0.9rem;
                    color: var(--primary);
                    font-weight: 700;
                }
                .court-price-tag .amount {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #fff;
                }
                .court-price-tag .period {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .court-actions-premium {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: auto;
                }
                .action-btn {
                    flex: 1;
                    height: 44px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .action-btn.delete {
                    flex: 0 0 44px;
                    color: #ff4d4d;
                }
                .action-btn.delete:hover {
                    background: rgba(255, 77, 77, 0.1);
                    border-color: rgba(255, 77, 77, 0.2);
                }
                
                /* Modal Refinements */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(15px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    padding: 1rem;
                }
                .modal-content-premium {
                    width: 100%;
                    max-width: 600px;
                    padding: 2.5rem;
                    border-radius: 32px;
                    position: relative;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .modal-header h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                }
                .close-modal {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .form-group input, .form-group select {
                    height: 50px;
                    padding: 0 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }
                .form-group input:focus {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--primary);
                    outline: none;
                }
                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: var(--primary);
                    font-weight: 800;
                }
                .input-with-icon input {
                    padding-left: 3.5rem;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2.5rem;
                }
                .loading-state {
                    grid-column: 1 / -1;
                    padding: 5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    color: var(--text-muted);
                }
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .empty-state-premium {
                    grid-column: 1 / -1;
                    padding: 6rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.02);
                    border: 2px dashed rgba(255, 255, 255, 0.05);
                    border-radius: 32px;
                }
                .empty-icon {
                    color: rgba(255, 255, 255, 0.1);
                    margin-bottom: 2rem;
                }
                .empty-state-premium h3 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                }
                .empty-state-premium p {
                    color: var(--text-muted);
                    max-width: 400px;
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .add-btn {
                        width: 100%;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal-content-premium {
                        padding: 1.5rem;
                    }
                }

                /* Image Upload Styles */
                .image-upload-area {
                    margin-top: 0.5rem;
                }
                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .upload-placeholder:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--primary);
                }
                .upload-icon {
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                }
                .upload-placeholder span {
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.25rem;
                }
                .upload-placeholder p {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .image-preview-container {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .image-preview {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-image-btn {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .remove-image-btn:hover {
                    background: #ff4d4d;
                    border-color: #ff4d4d;
                }
                .btn-loader {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(0, 0, 0, 0.1);
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 8px;
                }
            `}</style>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@arenax/ui";
import { supabase } from "@arenax/database";
import { useParams } from "next/navigation";

export default function SlotsPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [venueId, setVenueId] = useState<string | null>(null);
    const [openingTime, setOpeningTime] = useState("08:00");
    const [closingTime, setClosingTime] = useState("23:00");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Availability State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [courts, setCourts] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ courtId: string, time: string } | null>(null);
    const [bookingDuration, setBookingDuration] = useState(1);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    useEffect(() => {
        const fetchVenue = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('venues')
                    .select('id, opening_time, closing_time')
                    .eq('owner_id', userId)
                    .single();

                if (data) {
                    setVenueId(data.id);
                    if (data.opening_time) setOpeningTime(data.opening_time.slice(0, 5));
                    if (data.closing_time) setClosingTime(data.closing_time.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching venue:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVenue();
    }, [userId]);

    const fetchAvailability = async () => {
        if (!venueId) return;
        setAvailabilityLoading(true);
        try {
            // Fetch courts
            const { data: courtsData, error: courtsError } = await supabase
                .from('courts')
                .select('id, name, sport_type')
                .eq('venue_id', venueId);

            if (courtsError) throw courtsError;
            setCourts(courtsData || []);

            // Fetch bookings for the selected date
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id, 
                    court_id, 
                    start_time, 
                    end_time, 
                    status,
                    profiles:user_id (first_name, last_name)
                `)
                .eq('venue_id', venueId)
                .eq('date', selectedDate)
                .eq('status', 'confirmed');

            if (bookingsError) throw bookingsError;

            const formattedBookings = (bookingsData || []).map((b: any) => ({
                ...b,
                customer_name: b.profiles ? `${b.profiles.first_name} ${b.profiles.last_name}` : 'Walk-in'
            }));

            setBookings(formattedBookings);
        } catch (error) {
            console.error("Error fetching availability:", error);
        } finally {
            setAvailabilityLoading(false);
        }
    };

    useEffect(() => {
        if (venueId) {
            fetchAvailability();
        }
    }, [venueId, selectedDate]);

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = parseInt(openingTime.split(':')[0]);
        const endHour = parseInt(closingTime.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    const getBookingForSlot = (courtId: string, time: string) => {
        return bookings.find(b => {
            const bStart = b.start_time.slice(0, 5);
            const bEnd = b.end_time.slice(0, 5);
            return b.court_id === courtId && time >= bStart && time < bEnd;
        });
    };

    const handleBookNow = async () => {
        if (!selectedSlot || !venueId) return;

        setSaving(true);
        try {
            const startTime = selectedSlot.time;
            const [hours, minutes] = startTime.split(':').map(Number);
            const endHour = hours + bookingDuration;
            const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

            const { error } = await supabase
                .from('bookings')
                .insert({
                    venue_id: venueId,
                    court_id: selectedSlot.courtId,
                    date: selectedDate,
                    start_time: startTime + ":00",
                    end_time: endTime,
                    status: 'confirmed',
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_email: customerEmail
                });

            if (error) throw error;

            alert("Booking successful!");
            setShowBookingModal(false);
            setCustomerName("");
            setCustomerPhone("");
            setCustomerEmail("");
            setBookingDuration(1);
            fetchAvailability();
        } catch (error: any) {
            console.error("Error creating booking:", error);
            alert("Booking failed: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const WalkinBookingModal = () => {
        if (!selectedSlot) return null;
        const court = courts.find(c => c.id === selectedSlot.courtId);

        return (
            <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="header-icon-small">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                        </div>
                        <div className="header-text-modal">
                            <h3>Walk-in Booking</h3>
                            <p>Register a new customer for this slot</p>
                        </div>
                        <button className="close-btn" onClick={() => setShowBookingModal(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="slot-info-summary">
                            <div className="info-item">
                                <div className="item-header">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    <span className="label">Court</span>
                                </div>
                                <span className="value">{court?.name}</span>
                            </div>
                            <div className="info-item">
                                <div className="item-header">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span className="label">Date</span>
                                </div>
                                <span className="value">{new Date(selectedDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className="info-item">
                                <div className="item-header">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span className="label">Time</span>
                                </div>
                                <span className="value">{selectedSlot.time}</span>
                            </div>
                        </div>

                        <div className="booking-form">
                            <div className="input-group">
                                <label>Customer Name</label>
                                <div className="input-with-icon">
                                    <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="premium-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        <input
                                            type="tel"
                                            placeholder="012-3456789"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="premium-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email (Optional)</label>
                                    <div className="input-with-icon">
                                        <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            className="premium-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Booking Duration</label>
                                <div className="duration-selector">
                                    {[1, 2, 3, 4].map(h => (
                                        <button
                                            key={h}
                                            className={`duration-btn ${bookingDuration === h ? 'active' : ''}`}
                                            onClick={() => setBookingDuration(h)}
                                        >
                                            <span className="num">{h}</span>
                                            <span className="unit">Hour{h > 1 ? 's' : ''}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="cancel-btn-premium" onClick={() => setShowBookingModal(false)}>Cancel</button>
                        <Button variant="primary" onClick={handleBookNow} disabled={saving || !customerName || !customerPhone} className="confirm-btn-premium">
                            {saving ? (
                                <>
                                    <span className="btn-loader"></span>
                                    Booking...
                                </>
                            ) : "Confirm Booking"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueId) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('venues')
                .update({
                    opening_time: openingTime,
                    closing_time: closingTime
                })
                .eq('id', venueId);

            if (error) throw error;
            alert("Operating hours updated successfully!");

        } catch (error: any) {
            console.error("Error saving slots:", error);
            alert("Failed to update: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="slots-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Slot Management</h1>
                    <p>Configure your venue's availability and operating schedule.</p>
                </div>
            </header>

            <div className="slots-container">
                <Card className="settings-card" variant="glass">
                    <div className="card-header-premium">
                        <div className="header-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="header-text">
                            <h3>Operating Hours</h3>
                            <p>Define when your venue is open for bookings.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="loader"></div>
                            <p>Fetching schedule...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="premium-form">
                            <div className="time-grid">
                                <div className="time-input-group">
                                    <label>Opening Time</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="time"
                                            value={openingTime}
                                            onChange={(e) => setOpeningTime(e.target.value)}
                                            required
                                        />
                                        <div className="input-glow"></div>
                                    </div>
                                </div>

                                <div className="time-connector">
                                    <div className="line"></div>
                                    <span>to</span>
                                    <div className="line"></div>
                                </div>

                                <div className="time-input-group">
                                    <label>Closing Time</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="time"
                                            value={closingTime}
                                            onChange={(e) => setClosingTime(e.target.value)}
                                            required
                                        />
                                        <div className="input-glow"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="visual-timeline">
                                <div className="timeline-label">Schedule Preview</div>
                                <div className="timeline-bar">
                                    <div className="timeline-segment inactive" style={{ flex: parseInt(openingTime.split(':')[0]) }}></div>
                                    <div className="timeline-segment active" style={{ flex: (parseInt(closingTime.split(':')[0]) - parseInt(openingTime.split(':')[0])) }}>
                                        <span className="segment-text">Open for Bookings</span>
                                    </div>
                                    <div className="timeline-segment inactive" style={{ flex: (24 - parseInt(closingTime.split(':')[0])) }}></div>
                                </div>
                                <div className="timeline-markers">
                                    <span>00:00</span>
                                    <span>06:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>24:00</span>
                                </div>
                            </div>

                            <div className="form-footer">
                                <div className="info-tip">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    <span>Changes will apply to all courts immediately.</span>
                                </div>
                                <Button type="submit" variant="primary" className="save-btn" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="btn-loader"></span>
                                            Updating...
                                        </>
                                    ) : "Save Operating Hours"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>

                <Card className="info-card" variant="glass">
                    <h3>Pro Tip</h3>
                    <p>Setting accurate operating hours ensures players can only book during your supervised times. Most venues find 08:00 to 23:00 works best for community sports.</p>
                </Card>
            </div>

            {/* Availability Grid Section */}
            <div className="availability-section">
                <div className="section-header">
                    <div className="header-left">
                        <h2>Court Availability</h2>
                        <p>Real-time view of your courts. Click a slot to book for walk-in.</p>
                    </div>
                    <div className="date-picker-wrapper">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="premium-date-input"
                        />
                    </div>
                </div>

                <Card className="grid-card" variant="glass">
                    {availabilityLoading ? (
                        <div className="loading-state">
                            <div className="loader"></div>
                            <p>Loading availability...</p>
                        </div>
                    ) : courts.length === 0 ? (
                        <div className="empty-state">
                            <p>No courts found. Add courts in the Courts section first.</p>
                        </div>
                    ) : (
                        <div className="availability-grid-container">
                            <div className="grid-scroll-wrapper">
                                <table className="availability-table">
                                    <thead>
                                        <tr>
                                            <th className="sticky-col">Court</th>
                                            {generateTimeSlots().map(slot => (
                                                <th key={slot}>{slot}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courts.map(court => (
                                            <tr key={court.id}>
                                                <td className="sticky-col court-name-cell">
                                                    <span className="name">{court.name}</span>
                                                    <span className="type">{court.sport_type}</span>
                                                </td>
                                                {generateTimeSlots().map(slot => {
                                                    const booking = getBookingForSlot(court.id, slot);
                                                    return (
                                                        <td
                                                            key={slot}
                                                            className={`slot-cell ${booking ? 'booked' : 'available'}`}
                                                            onClick={() => {
                                                                if (!booking) {
                                                                    setSelectedSlot({ courtId: court.id, time: slot });
                                                                    setShowBookingModal(true);
                                                                }
                                                            }}
                                                        >
                                                            {booking ? (
                                                                <div className="booking-indicator">
                                                                    <span className="customer">{booking.customer_name}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="available-indicator">
                                                                    <span>Available</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {showBookingModal && <WalkinBookingModal />}

            <style jsx>{`
                .slots-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    padding-bottom: 3rem;
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
                .slots-container {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 2rem;
                    align-items: start;
                }
                @media (max-width: 1200px) {
                    .slots-container {
                        grid-template-columns: 1fr;
                    }
                    .info-card {
                        order: -1;
                    }
                }
                .settings-card {
                    padding: 2.5rem;
                    border-radius: 32px;
                }
                .card-header-premium {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                    margin-bottom: 3rem;
                }
                .header-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(0, 158, 96, 0.1);
                    border: 1px solid rgba(0, 158, 96, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }
                .header-text h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                }
                .header-text p {
                    color: var(--text-muted);
                }
                .time-grid {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 4rem;
                }
                @media (max-width: 600px) {
                    .time-grid {
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                    .time-connector {
                        flex-direction: row;
                        width: 100%;
                        justify-content: center;
                    }
                    .time-connector .line {
                        width: 40px;
                        height: 2px;
                    }
                }
                .time-input-group {
                    flex: 1;
                    max-width: 200px;
                }
                .time-input-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.75rem;
                    text-align: center;
                }
                .input-wrapper {
                    position: relative;
                }
                .input-wrapper input {
                    width: 100%;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-align: center;
                    color-scheme: dark;
                    transition: all 0.3s ease;
                }
                .input-wrapper input:focus {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 20px rgba(0, 158, 96, 0.1);
                }
                .time-connector {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                }
                .time-connector .line {
                    width: 2px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                }
                .visual-timeline {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 2rem;
                    border-radius: 24px;
                    margin-bottom: 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .timeline-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }
                .timeline-bar {
                    height: 48px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .timeline-segment.inactive {
                    background: transparent;
                }
                .timeline-segment.active {
                    background: linear-gradient(90deg, rgba(0, 158, 96, 0.2) 0%, rgba(0, 158, 96, 0.4) 100%);
                    border-left: 2px solid var(--primary);
                    border-right: 2px solid var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .segment-text {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .timeline-markers {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 0.75rem;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .form-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    gap: 1.5rem;
                }
                @media (max-width: 600px) {
                    .form-footer {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .info-tip {
                        justify-content: center;
                    }
                }
                .info-tip {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .save-btn {
                    height: 56px;
                    padding: 0 2.5rem;
                    font-weight: 800;
                    border-radius: 16px;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .info-card {
                    padding: 2rem;
                    border-radius: 24px;
                    background: linear-gradient(135deg, rgba(0, 158, 96, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
                }
                .info-card h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    color: var(--primary);
                }
                .info-card p {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 2rem;
                    }
                    .settings-card {
                        padding: 1.5rem;
                    }
                    .visual-timeline {
                        padding: 1.25rem;
                    }
                    .timeline-markers {
                        font-size: 0.65rem;
                    }
                }
                .loading-state {
                    padding: 4rem;
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
                .btn-loader {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(0, 0, 0, 0.1);
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .availability-section {
                    margin-top: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    gap: 1.5rem;
                }
                @media (max-width: 768px) {
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .date-picker-wrapper {
                        width: 100%;
                    }
                    .premium-date-input {
                        width: 100%;
                    }
                }
                @media (max-width: 640px) {
                    .time-grid {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .time-connector {
                        flex-direction: row;
                    }
                    .time-connector .line {
                        width: 20px;
                        height: 2px;
                    }
                    .form-footer {
                        flex-direction: column;
                        gap: 1.5rem;
                        align-items: stretch;
                    }
                    .save-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }

                /* Availability Grid Styles */
                .availability-section {
                    margin-top: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 1.5rem;
                }
                .section-header h2 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                }
                .premium-date-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    padding: 0.75rem 1rem;
                    font-family: inherit;
                    font-weight: 600;
                    color-scheme: dark;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .premium-date-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 15px rgba(0, 158, 96, 0.2);
                }
                .grid-card {
                    padding: 0;
                    overflow: hidden;
                    border-radius: 24px;
                }
                .availability-grid-container {
                    width: 100%;
                    position: relative;
                }
                .grid-scroll-wrapper {
                    overflow-x: auto;
                    width: 100%;
                    -webkit-overflow-scrolling: touch;
                }
                .availability-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 900px;
                }
                @media (max-width: 600px) {
                    .availability-table {
                        min-width: 700px;
                    }
                    .sticky-col {
                        min-width: 120px;
                    }
                }
                .availability-table th {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 1.25rem;
                    text-align: center;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                }
                .availability-table td {
                    padding: 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    height: 80px;
                }
                .sticky-col {
                    position: sticky;
                    left: 0;
                    background: #0a0a0a !important;
                    z-index: 10;
                    min-width: 180px;
                    border-right: 2px solid rgba(255, 255, 255, 0.1) !important;
                }
                .court-name-cell {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 1.5rem !important;
                }
                .court-name-cell .name {
                    font-weight: 800;
                    color: #fff;
                    font-size: 1rem;
                }
                .court-name-cell .type {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .slot-cell {
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .slot-cell.available:hover {
                    background: rgba(0, 158, 96, 0.05);
                }
                .slot-cell.booked {
                    background: rgba(255, 255, 255, 0.02);
                    cursor: default;
                }
                .booking-indicator {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                }
                .booking-indicator .customer {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #fff;
                    text-align: center;
                    width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .available-indicator {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                .slot-cell.available:hover .available-indicator {
                    opacity: 1;
                }
                .available-indicator span {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `}</style>

            <style jsx global>{`
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 1.5rem;
                }
                .premium-modal {
                    width: 100%;
                    max-width: 550px;
                    background: #0a0a0a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 158, 96, 0.05);
                    animation: modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes modalAppear {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .modal-header {
                    padding: 2rem 2.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    position: relative;
                    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent);
                }
                .header-icon-small {
                    width: 52px;
                    height: 52px;
                    background: rgba(0, 158, 96, 0.1);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    border: 1px solid rgba(0, 158, 96, 0.2);
                }
                .header-text-modal h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                    color: #fff;
                    letter-spacing: -0.5px;
                }
                .header-text-modal p {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .close-btn {
                    position: absolute;
                    right: 2rem;
                    top: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    transform: rotate(90deg);
                }
                .modal-body {
                    padding: 2.5rem;
                }
                .slot-info-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 1.75rem;
                    border-radius: 24px;
                    margin-bottom: 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }
                .item-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                }
                .info-item .label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                }
                .info-item .value {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                }
                .booking-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .form-row {
                    display: flex;
                    gap: 1.5rem;
                }
                .form-row .input-group {
                    flex: 1;
                }
                .input-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .field-icon {
                    position: absolute;
                    left: 1.25rem;
                    color: var(--text-muted);
                    pointer-events: none;
                    transition: color 0.3s ease;
                }
                .premium-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.1rem 1.25rem 1.1rem 3.25rem;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .premium-input:focus {
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 25px rgba(0, 158, 96, 0.15);
                }
                .premium-input:focus + .field-icon,
                .input-with-icon:focus-within .field-icon {
                    color: var(--primary);
                }
                .duration-selector {
                    display: flex;
                    gap: 1rem;
                }
                .duration-btn {
                    flex: 1;
                    height: 70px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .duration-btn .num {
                    font-size: 1.25rem;
                    font-weight: 800;
                }
                .duration-btn .unit {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    opacity: 0.6;
                }
                .duration-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }
                .duration-btn.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: #000;
                    box-shadow: 0 10px 25px rgba(0, 158, 96, 0.3);
                }
                .duration-btn.active .unit {
                    opacity: 0.8;
                }
                .modal-footer {
                    padding: 1.5rem 2.5rem 2.5rem;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .cancel-btn-premium {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                .cancel-btn-premium:hover {
                    color: #fff;
                }
                .confirm-btn-premium {
                    height: 56px;
                    padding: 0 2.5rem !important;
                    border-radius: 16px !important;
                    font-size: 1.05rem !important;
                    font-weight: 800 !important;
                    box-shadow: 0 10px 20px rgba(0, 158, 96, 0.2) !important;
                }
            `}</style>
        </div>
    );
}

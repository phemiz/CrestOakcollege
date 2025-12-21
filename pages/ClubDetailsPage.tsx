import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi, joinStudentClub } from '../hooks/useApi';
import { ClubDetail, NewClubMemberData } from '../types';
import { useTheme } from '../hooks/useTheme';
import NotFoundPage from './NotFoundPage';
import Modal from '../components/Modal';

const useClubApi = (clubId?: string) => {
    const { data: clubs, loading, error, refetch } = useApi<ClubDetail[]>('/api/club-details');
    const club = clubs?.find(c => c.id === clubId);
    return { club, loading, error, refetch };
};

const ImageGallery: React.FC<{ images: ClubDetail['galleryImages'], theme: any }> = ({ images, theme }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNavClick = (direction: 'prev' | 'next') => {
        const container = scrollContainerRef.current;
        if (container) {
            const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < images.length) {
                const scrollAmount = container.clientWidth * newIndex;
                container.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    const handleDotClick = (index: number) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = container.clientWidth * index;
             container.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                setCurrentIndex(index);
            }
        });
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const observer = new IntersectionObserver(observerCallback, {
            root: container,
            rootMargin: '0px',
            threshold: 0.51
        });
        
        const children = Array.from(container.children);
        children.forEach(child => observer.observe(child as Element));

        return () => {
             children.forEach(child => observer.unobserve(child as Element));
        };
    }, [observerCallback]);

    return (
        <div className="relative">
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-lg scrollbar-hide"
                style={{ scrollbarWidth: 'none' }} /* For Firefox */
            >
                {images.map((img, index) => (
                    <div key={index} data-index={index} className="flex-shrink-0 w-full snap-start relative">
                        <img src={img.imageUrl} alt={img.caption} className="w-full h-80 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <p className="text-white text-sm font-semibold">{img.caption}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Navigation Buttons */}
            <button 
                onClick={() => handleNavClick('prev')}
                disabled={currentIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 disabled:opacity-50 transition"
                aria-label="Previous image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
             <button 
                onClick={() => handleNavClick('next')}
                disabled={currentIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 disabled:opacity-50 transition"
                aria-label="Next image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                        aria-label={`Go to image ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

interface JoinClubModalProps {
    isOpen: boolean;
    onClose: () => void;
    clubName: string;
    onSubmit: (data: NewClubMemberData) => Promise<{ success: boolean; message: string; }>;
}

const JoinClubModal: React.FC<JoinClubModalProps> = ({ isOpen, onClose, clubName, onSubmit }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useState<NewClubMemberData>({ name: '', studentId: '', reason: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', studentId: '', reason: '' });
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.studentId || !formData.reason) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        
        const result = await onSubmit(formData);

        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => onClose(), 2000);
        } else {
            setError(result.message || 'An error occurred.');
        }
        setLoading(false);
    };

    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Join ${clubName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="studentId" className={`block text-sm font-medium ${theme.textMuted}`}>Student ID</label>
                    <input type="text" name="studentId" id="studentId" value={formData.studentId} onChange={handleChange} className={inputClasses} required placeholder="e.g., CST/21/001" />
                </div>
                <div>
                    <label htmlFor="reason" className={`block text-sm font-medium ${theme.textMuted}`}>Reason for Joining</label>
                    <textarea name="reason" id="reason" rows={3} value={formData.reason} onChange={handleChange} className={inputClasses} required />
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`} disabled={loading}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ClubDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { club, loading, error, refetch } = useClubApi(id);
    const { theme } = useTheme();

    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const getInitialJoinStatus = useCallback(() => {
        try {
            return localStorage.getItem(`club_join_status_${id}`) === 'sent';
        } catch {
            return false;
        }
    }, [id]);
    const [hasJoined, setHasJoined] = useState(getInitialJoinStatus);
    
    useEffect(() => {
        setHasJoined(getInitialJoinStatus());
    }, [id, getInitialJoinStatus]);

    if (loading) {
        return <PageWrapper title="Loading Club..."><div className="text-center">Loading...</div></PageWrapper>;
    }

    if (error || !club) {
        return <NotFoundPage />;
    }

    const cardBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
    const hasGallery = club.galleryImages && club.galleryImages.length > 0;

    const handleJoinSubmit = async (data: NewClubMemberData) => {
        const result = await joinStudentClub(club.id, data);
        if (result.success) {
            refetch();
            setHasJoined(true);
            try {
                localStorage.setItem(`club_join_status_${club.id}`, 'sent');
            } catch (e) {
                console.error("Could not save join status to localStorage", e);
            }
        }
        return result;
    };

    return (
        <PageWrapper title={club.name}>
             <div className="max-w-4xl mx-auto">
                <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
                    <img src={club.imageUrl} alt={`${club.name} banner`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-8">
                        <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                             <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>About Us</h2>
                             <p className={theme.textMuted}>{club.description}</p>
                        </div>

                        {hasGallery && (
                             <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                                 <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Gallery</h2>
                                 <ImageGallery images={club.galleryImages} theme={theme} />
                             </div>
                        )}

                        <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                            <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Announcements</h2>
                            {club.announcements.length > 0 ? (
                                <ul className="space-y-4">
                                    {club.announcements.map(ann => (
                                        <li key={ann.id} className={`border-l-4 pl-4 ${theme.name === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-400 bg-white/5'} p-3 rounded-r-md`}>
                                            <p className={`font-semibold ${theme.text}`}>{ann.title}</p>
                                            <p className={`text-sm ${theme.textMuted}`}>{new Date(ann.date).toLocaleDateString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={theme.textMuted}>No announcements yet.</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Interested?</h3>
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                disabled={hasJoined}
                                className={`w-full text-center ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-6 rounded-full inline-block ${theme.button.primary.hover} transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {hasJoined ? 'Request Sent' : 'Join Us'}
                            </button>
                        </div>
                        <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Contact</h3>
                            <a href={`mailto:${club.contactEmail}`} className={`font-semibold text-sm ${theme.accent} hover:underline break-all`}>
                                {club.contactEmail}
                            </a>
                        </div>
                        <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Members ({club.members.length})</h3>
                            <div className="flex -space-x-2 overflow-hidden">
                                {club.members.slice(0, 7).map(member => (
                                     <img key={member.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800" src={member.imageUrl} alt={member.name} title={member.name} />
                                ))}
                                {club.members.length > 7 && <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">+{club.members.length - 7}</div>}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
             <JoinClubModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                clubName={club.name}
                onSubmit={handleJoinSubmit}
            />
        </PageWrapper>
    );
};
export default ClubDetailsPage;
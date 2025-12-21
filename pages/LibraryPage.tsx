
import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { LibraryBook, BookStatus } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const BookCard: React.FC<{ book: LibraryBook }> = ({ book }) => {
    const { theme } = useTheme();
    const [reservationStatus, setReservationStatus] = useState<'idle' | 'reserving' | 'reserved'>('idle');

    const getStatusClasses = (status: BookStatus) => {
        return status === BookStatus.Available
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const handleReserve = () => {
        if (book.status !== BookStatus.Available) return;
        setReservationStatus('reserving');
        // Mock API call for reservation
        setTimeout(() => {
            setReservationStatus('reserved');
        }, 1000);
    };


    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 flex flex-col h-full`}>
            <div className="flex-grow">
                <h3 className={`text-xl font-bold ${theme.card.text}`}>{book.title}</h3>
                <p className={`text-sm font-semibold ${theme.accent} mt-1`}>{book.author}</p>
                <p className={`${theme.card.textMuted} mt-2 text-sm`}>{book.description}</p>
            </div>
            <div className={`mt-4 pt-4 border-t ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} flex flex-col gap-4`}>
                <div className="flex justify-between items-center text-xs">
                    <p className={theme.textMuted}>ISBN: {book.isbn}</p>
                    <span className={`font-bold px-2.5 py-1 rounded-full ${getStatusClasses(book.status)}`}>
                        {book.status}
                    </span>
                </div>
                {book.status === BookStatus.Available ? (
                    <button
                        onClick={handleReserve}
                        disabled={reservationStatus !== 'idle'}
                        className={`w-full text-center text-sm font-bold py-2 px-4 rounded-full transition-colors duration-300 disabled:opacity-70 ${
                            reservationStatus === 'reserved' 
                            ? 'bg-green-500 text-white cursor-default'
                            : `${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`
                        }`}
                    >
                        {reservationStatus === 'idle' && 'Reserve Book'}
                        {reservationStatus === 'reserving' && 'Reserving...'}
                        {reservationStatus === 'reserved' && 'Reserved!'}
                    </button>
                ) : (
                    <p className="text-xs text-center text-red-500 font-semibold">Due on: {new Date(book.dueDate!).toLocaleDateString()}</p>
                )}
            </div>
        </div>
    );
};


const LibraryPage: React.FC = () => {
    const { data: books, loading, error, refetch } = useApi<LibraryBook[]>('/api/library-books');
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();

    const filteredBooks = useMemo(() => {
        if (!books) return [];
        const lowercasedQuery = searchQuery.toLowerCase();
        return books.filter(book => 
            book.title.toLowerCase().includes(lowercasedQuery) ||
            book.author.toLowerCase().includes(lowercasedQuery) ||
            book.isbn.includes(lowercasedQuery)
        );
    }, [books, searchQuery]);

    return (
        <PageWrapper
            title="Online Library"
            subtitle="Search our catalog for books and academic resources."
        >
             <div className="max-w-6xl mx-auto">
                <div className="mb-8 max-w-xl mx-auto">
                     <input 
                        type="search"
                        placeholder="Search by title, author, or ISBN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} px-4 py-3 rounded-full shadow-sm focus:outline-none ${theme.input.focus}`}
                        aria-label="Search library catalog"
                    />
                </div>

                {loading && <SkeletonGrid count={6} type="card" />}
                {error && <ErrorDisplay message={`Could not load books: ${error}`} onRetry={refetch} />}
                
                {!loading && !error && (
                    filteredBooks.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className={`text-2xl font-semibold ${theme.text}`}>No Books Found</h3>
                            <p className={`${theme.textMuted} mt-2`}>There are no books matching your search criteria.</p>
                        </div>
                    )
                )}
            </div>
        </PageWrapper>
    );
};

export default LibraryPage;

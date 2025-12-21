
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi, rsvpToEvent, getCurrentStudent, getCurrentStaff } from '../hooks/useApi';
import { CalendarEvent } from '../types';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// --- .ics File Generation Helper ---
const generateIcsFile = (event: CalendarEvent) => {
    const eventDate = new Date(event.date);
    eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset()); // Adjust for timezone to get UTC date
    const startDate = eventDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDate = new Date(eventDate);
    endDate.setDate(eventDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CrestOAK College//Event Calendar//EN',
        'BEGIN:VEVENT',
        `UID:${event.id}@crestoak.college`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}Z`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${endDateStr}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// --- Attendees Export Helper ---
const exportAttendees = (event: CalendarEvent) => {
    const header = "Name,Event,Date\n";
    const rows = event.attendees?.map(name => `"${name}","${event.title}","${event.date}"`).join("\n") || "";
    const csvContent = header + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


// --- Event Detail Modal ---
const EventDetailModal: React.FC<{ event: CalendarEvent | null; onClose: () => void; }> = ({ event, onClose }) => {
    const { theme } = useTheme();
    const [showAttendees, setShowAttendees] = useState(false);

    if (!event) return null;

    const attendeesList = event.attendees || [];

    return (
        <Modal isOpen={!!event} onClose={onClose} title={event.title}>
            <div className="space-y-4">
                <p className={`${theme.textMuted}`}><strong className={theme.text}>Date:</strong> {formatDate(event.date)}</p>
                <p className={`${theme.textMuted}`}><strong className={theme.text}>Category:</strong> {event.category}</p>
                <p className={`${theme.textMuted}`}>{event.description}</p>
                
                {showAttendees ? (
                    <div className={`mt-4 pt-4 border-t ${theme.input.border}`}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-bold ${theme.text}`}>Attendees ({attendeesList.length})</h4>
                            <button onClick={() => exportAttendees(event)} className={`text-xs font-semibold ${theme.accent} hover:underline`}>Export List</button>
                        </div>
                        <ul className="max-h-32 overflow-y-auto space-y-1 text-sm">
                            {attendeesList.length > 0 ? attendeesList.map((name, i) => (
                                <li key={i} className={theme.textMuted}>{name}</li>
                            )) : <li className="italic text-gray-400">No attendees yet.</li>}
                        </ul>
                        <button onClick={() => setShowAttendees(false)} className={`mt-2 text-xs ${theme.textMuted} hover:${theme.text} underline`}>Hide List</button>
                    </div>
                ) : (
                    <button onClick={() => setShowAttendees(true)} className={`text-sm font-semibold ${theme.accent} hover:underline`}>
                        View Attendees ({event.rsvps})
                    </button>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={() => generateIcsFile(event)} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Add to Calendar</button>
                    <button onClick={onClose} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`}>Close</button>
                </div>
            </div>
        </Modal>
    );
};

interface CalendarViewProps {
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onRsvp: (eventId: string, e: React.MouseEvent) => void;
    rsvpedEvents: Record<string, boolean>;
}

interface DateBasedCalendarViewProps extends CalendarViewProps {
    currentDate: Date;
}


const MonthView: React.FC<DateBasedCalendarViewProps> = ({ currentDate, events, onEventClick, onRsvp, rsvpedEvents }) => {
    const { theme } = useTheme();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };
    
    const getEventCategoryColor = (category: CalendarEvent['category']) => ({'Academic': 'bg-blue-500', 'Campus Life': 'bg-green-500', 'Holiday': 'bg-yellow-500'}[category] || 'bg-gray-500');

    const cellBaseClass = `relative min-h-[120px] p-1 border ${theme.name === 'light' ? 'border-gray-200' : 'border-white/10'}`;
    const cellBgClass = theme.name === 'light' ? 'bg-white' : 'bg-transparent';
    const dayNumberClass = (day: number) => `text-xs font-semibold ${new Date().toDateString() === new Date(year, month, day).toDateString() ? theme.accent : theme.textMuted}`;
    
    return (
        <>
            <div className={`grid grid-cols-7 text-center text-xs font-bold ${theme.textMuted} mb-2`}>
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className={cellBaseClass}></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    return (
                        <div key={day} className={`${cellBaseClass} ${cellBgClass} flex flex-col`}>
                            <span className={dayNumberClass(day)}>{day}</span>
                            <div className="space-y-1 mt-1 overflow-y-auto">
                                {dayEvents.map((event) => {
                                    const isRsvped = rsvpedEvents[event.id];
                                    return (
                                        <div key={event.id}>
                                            <div onClick={() => onEventClick(event)} className="cursor-pointer">
                                                <p className={`text-xs font-semibold p-1 rounded ${getEventCategoryColor(event.category)} text-white break-words`}>{event.title}</p>
                                            </div>
                                            {event.category !== 'Holiday' && (
                                                <div className="flex items-center justify-between mt-1">
                                                    <button onClick={(e) => onRsvp(event.id, e)} disabled={isRsvped} className={`text-xs px-2 py-0.5 rounded transition-colors ${isRsvped ? 'bg-green-200 text-green-800' : `${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}`}>
                                                        {isRsvped ? `✔` : `RSVP`}
                                                    </button>
                                                    {event.rsvps > 0 && (
                                                        <button onClick={() => onEventClick(event)} className="flex items-center text-xs text-gray-500 hover:text-gray-700" title={`${event.rsvps} people going`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                            {event.rsvps}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
};

const WeekView: React.FC<DateBasedCalendarViewProps> = ({ currentDate, events, onEventClick, onRsvp, rsvpedEvents }) => {
    const { theme } = useTheme();
    const weekDays = getWeekDays(currentDate);

    const getEventsForDay = (day: Date) => {
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-px">
            {weekDays.map(day => (
                <div key={day.toISOString()} className={`p-2 ${theme.card.background} ${theme.card.border}`}>
                    <h4 className="text-center font-bold text-sm mb-2">{day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}</h4>
                    <div className="space-y-2">
                        {getEventsForDay(day).length > 0 ? getEventsForDay(day).map((event) => {
                            const isRsvped = rsvpedEvents[event.id];
                            return (
                                <div key={event.id} className={`p-2 rounded-md ${theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                                    <div onClick={() => onEventClick(event)} className="cursor-pointer">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs text-gray-500">{event.category}</p>
                                    </div>
                                    {event.category !== 'Holiday' && (
                                        <div className="flex items-center justify-between mt-2">
                                            <button onClick={(e) => onRsvp(event.id, e)} disabled={isRsvped} className={`text-xs px-2 py-1 rounded transition-colors ${isRsvped ? 'bg-green-200 text-green-800' : `${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}`}>
                                                {isRsvped ? `✔` : `RSVP`}
                                            </button>
                                            {event.rsvps > 0 && (
                                                <button onClick={() => onEventClick(event)} className="flex items-center text-xs text-gray-500 hover:text-gray-700" title={`${event.rsvps} people going`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                    {event.rsvps}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : <p className="text-xs text-center text-gray-400">No events</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AgendaView: React.FC<CalendarViewProps> = ({ events, onEventClick, onRsvp, rsvpedEvents }) => {
    const { theme } = useTheme();
    const eventsByDate = useMemo(() => {
        const groupedEvents: Record<string, CalendarEvent[]> = {};
        if (Array.isArray(events)) {
            [...events]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .forEach(event => {
                    const date = event.date;
                    if (!groupedEvents[date]) {
                        groupedEvents[date] = [];
                    }
                    groupedEvents[date].push(event);
                });
        }
        return groupedEvents;
    }, [events]);

    return (
        <div className="space-y-6">
            {Object.keys(eventsByDate).length > 0 ? Object.keys(eventsByDate).map(date => {
                const dayEvents = eventsByDate[date];
                return (
                <div key={date}>
                    <h4 className={`font-bold ${theme.accent} border-b ${theme.input.border} pb-2 mb-3`}>{formatDate(date)}</h4>
                    <ul className="space-y-3">
                        {dayEvents.map((event) => {
                            const isRsvped = rsvpedEvents[event.id];
                            return (
                                <li key={event.id} className={`p-3 rounded-md flex items-center justify-between ${theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                                    <div onClick={() => onEventClick(event)} className="cursor-pointer flex-grow">
                                        <p className={`font-semibold ${theme.text}`}>{event.title}</p>
                                        <p className={`text-sm ${theme.textMuted}`}>{event.category}</p>
                                    </div>
                                    {event.category !== 'Holiday' && (
                                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                            {event.rsvps > 0 && (
                                                <button onClick={() => onEventClick(event)} className="flex items-center text-sm text-gray-500 hover:text-gray-700" title={`${event.rsvps} people going`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                    {event.rsvps}
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); onRsvp(event.id, e); }} disabled={isRsvped} className={`text-sm px-4 py-1.5 rounded-full transition-colors ${isRsvped ? 'bg-green-200 text-green-800 cursor-default' : `${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} ${theme.button.secondary.hover}`}`}>
                                                {isRsvped ? `✔` : `RSVP`}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}) : (
                 <div className="text-center py-12">
                    <h3 className={`text-2xl font-semibold ${theme.text}`}>No Events Found</h3>
                    <p className={`${theme.textMuted} mt-2`}>There are no events matching your current filters.</p>
                </div>
            )}
        </div>
    );
};


const EventsCalendarPage: React.FC = () => {
    const { theme } = useTheme();
    const { data: initialEvents, loading, error, refetch } = useApi<CalendarEvent[]>('/api/events');
    const [events, setEvents] = useState<CalendarEvent[] | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeView, setActiveView] = useState<'month' | 'week' | 'agenda'>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const RSVP_STORAGE_KEY = 'crestoak_rsvped_events';
    const [rsvpedEvents, setRsvpedEvents] = useState<Record<string, boolean>>(() => {
        try {
            const stored = localStorage.getItem(RSVP_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch { return {}; }
    });

    useEffect(() => { if (initialEvents) setEvents(initialEvents) }, [initialEvents]);
    
    const handleRsvp = useCallback(async (eventId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newRsvpedEvents = { ...rsvpedEvents, [eventId]: true };
        setRsvpedEvents(newRsvpedEvents);
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(newRsvpedEvents));

        const student = getCurrentStudent();
        const staff = getCurrentStaff();
        const userName = student ? student.name : staff ? staff.name : 'Guest User';

        const result = await rsvpToEvent(eventId, userName);
        if (result.success && result.newRsvpCount !== undefined) {
            setEvents(prevEvents => 
                prevEvents?.map(ev => {
                    if (ev.id === eventId) {
                        return { ...ev, rsvps: result.newRsvpCount!, attendees: [...(ev.attendees || []), userName] };
                    }
                    return ev;
                }) || null
            );
        } else {
            const rolledBackRsvps = { ...rsvpedEvents };
            delete rolledBackRsvps[eventId];
            setRsvpedEvents(rolledBackRsvps);
            localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(rolledBackRsvps));
        }
    }, [rsvpedEvents]);

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter(event => {
            const categoryMatch = categoryFilter === 'all' || event.category === categoryFilter;
            const searchMatch = searchQuery.trim() === '' ||
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [events, categoryFilter, searchQuery]);
    
    const categoryCounts = useMemo(() => {
        const allEvents = initialEvents || [];
        return {
            all: allEvents.length,
            Academic: allEvents.filter(e => e.category === 'Academic').length,
            'Campus Life': allEvents.filter(e => e.category === 'Campus Life').length,
            Holiday: allEvents.filter(e => e.category === 'Holiday').length,
        };
    }, [initialEvents]);

    // Date navigation
    const changeMonth = (delta: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    const goToToday = () => setCurrentDate(new Date());

    const navButtonClasses = `px-3 py-1.5 text-sm rounded-md transition-colors ${theme.name === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white/10 hover:bg-white/20'}`;
    const viewButtonClasses = (view: typeof activeView) => `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeView === view ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.card.background} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`;
    
    return (
        <PageWrapper
            title="Events Calendar"
            subtitle="Explore upcoming academic deadlines, campus activities, and holidays."
        >
            {loading && (
                <div className="space-y-4">
                    <SkeletonLoader type="line" className="h-12 w-full" />
                    <SkeletonLoader type="card" className="h-64 w-full" />
                </div>
            )}
            {error && <ErrorDisplay message={`Could not load events: ${error}`} onRetry={refetch} />}
            
            {!loading && !error && (
                 <div className="max-w-6xl mx-auto">
                    {/* Toolbar */}
                    <div className={`p-4 rounded-lg mb-6 flex flex-col md:flex-row items-center gap-4 ${theme.name === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => changeMonth(-1)} className={navButtonClasses}>&lt; Prev</button>
                            <button onClick={goToToday} className={navButtonClasses}>Today</button>
                            <button onClick={() => changeMonth(1)} className={navButtonClasses}>Next &gt;</button>
                        </div>
                        <h3 className={`flex-grow text-center text-lg font-bold ${theme.text}`}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        {/* View Switcher */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveView('month')} className={viewButtonClasses('month')}>Month</button>
                            <button onClick={() => setActiveView('week')} className={viewButtonClasses('week')}>Week</button>
                            <button onClick={() => setActiveView('agenda')} className={viewButtonClasses('agenda')}>Agenda</button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} px-4 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`} aria-label="Filter by category">
                            <option value="all">All Categories ({categoryCounts.all})</option>
                            <option value="Academic">Academic ({categoryCounts.Academic})</option>
                            <option value="Campus Life">Campus Life ({categoryCounts['Campus Life']})</option>
                            <option value="Holiday">Holiday ({categoryCounts.Holiday})</option>
                        </select>
                        <input type="search" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} px-4 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`} aria-label="Search events" />
                    </div>

                    {activeView === 'month' && <MonthView currentDate={currentDate} events={filteredEvents} onEventClick={setSelectedEvent} onRsvp={handleRsvp} rsvpedEvents={rsvpedEvents} />}
                    {activeView === 'agenda' && <AgendaView events={filteredEvents} onEventClick={setSelectedEvent} onRsvp={handleRsvp} rsvpedEvents={rsvpedEvents} />}
                    {activeView === 'week' && <WeekView currentDate={currentDate} events={filteredEvents} onEventClick={setSelectedEvent} onRsvp={handleRsvp} rsvpedEvents={rsvpedEvents} />}
                    
                    <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                </div>
            )}
        </PageWrapper>
    );
};

export default EventsCalendarPage;

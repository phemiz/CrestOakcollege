import React from 'react';
import { useTheme } from '../hooks/useTheme';

const partners = [
    { name: 'Coal City University', location: 'Enugu, Enugu State', affiliation: 'Academic Partner' },
    { name: 'British American Open University', location: 'California, USA', affiliation: 'International Partner' },
    { name: 'Gregory University', location: 'Uturu, Abia State', affiliation: 'Academic Partner' },
    { name: 'Peaceland University', location: 'Enugu, Enugu State', affiliation: 'Academic Partner' },
    { name: 'Charisma University', location: 'United Kingdom', affiliation: 'International Partner' },
];

const PartnerLogo: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const PartnerCard: React.FC<{ partner: typeof partners[0] }> = ({ partner }) => {
    const { theme } = useTheme();
    const tooltipArrowColor = theme.button.primary.background.replace('bg-', 'border-t-');
    
    return (
        <div className="group relative flex flex-col items-center justify-center text-center p-4">
            <div className={`transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-110 ${theme.textMuted} group-hover:${theme.accent}`}>
                <PartnerLogo />
            </div>
            <p className={`mt-2 text-sm font-semibold ${theme.text}`}>{partner.name}</p>
            {/* Tooltip */}
            <div role="tooltip" className={`absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs ${theme.button.primary.background} ${theme.button.primary.text} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                <strong>{partner.location}</strong>
                <br />
                <span>{partner.affiliation}</span>
                <div className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 ${tooltipArrowColor}`}></div>
            </div>
        </div>
    );
};


const PartnerUniversities: React.FC = () => {
    return (
        <>
            {/* Mobile: Carousel */}
            <div className="md:hidden" aria-label="Partner universities carousel">
                <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {partners.map(partner => (
                        <div key={partner.name} className="flex-shrink-0 w-2/3 sm:w-1/2 snap-center">
                             <PartnerCard partner={partner} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 items-center justify-items-center max-w-5xl mx-auto">
                 {partners.map(partner => (
                    <PartnerCard key={partner.name} partner={partner} />
                ))}
            </div>
        </>
    );
};

export default PartnerUniversities;

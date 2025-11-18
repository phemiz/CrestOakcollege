import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { CampusBuilding } from '../types';
import Modal from './Modal';

const CAMPUS_BUILDINGS: CampusBuilding[] = [
    { id: 'admin', name: 'Admin Block', description: 'Main administrative offices, admissions, and student services.', svgPathId: 'building-admin' },
    { id: 'health', name: 'Faculty of Health Sciences', description: 'Houses the Nursing, Public Health, and Medical Laboratory Science departments.', svgPathId: 'building-health' },
    { id: 'tech', name: 'Faculty of Science & Technology', description: 'Home to Computer Science, Engineering labs, and research facilities.', svgPathId: 'building-tech' },
    { id: 'library', name: 'Main Library', description: 'A quiet space for study and research, with a vast collection of books and digital resources.', svgPathId: 'building-library' },
    { id: 'cafe', name: 'Student Cafeteria', description: 'Offers a variety of meals and snacks. A great place to relax and socialize.', svgPathId: 'building-cafe' },
];

const InteractiveCampusMap: React.FC = () => {
    const { theme } = useTheme();
    const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);

    const handleBuildingClick = (buildingId: string) => {
        const building = CAMPUS_BUILDINGS.find(b => b.id === buildingId);
        if (building) {
            setSelectedBuilding(building);
        }
    };

    const buildingFill = theme.name === 'light' ? 'fill-gray-200' : 'fill-white/10';
    const buildingStroke = theme.name === 'light' ? 'stroke-gray-400' : 'stroke-white/30';
    const buildingHover = theme.name === 'light' ? 'hover:fill-blue-200' : 'hover:fill-blue-500/30';

    return (
        <div className={`p-4 rounded-lg shadow-md ${theme.card.background} ${theme.card.border}`}>
            <svg viewBox="0 0 400 300" className="w-full h-auto" aria-labelledby="map-title">
                <title id="map-title">Interactive Campus Map</title>
                <g className="grass" fill={theme.name === 'light' ? '#EBF5EB' : '#2C3E50'}>
                    <rect width="400" height="300" />
                </g>
                <g className="paths" fill="none" stroke={theme.name === 'light' ? '#D5DBDB' : '#566573'} strokeWidth="8">
                    <path d="M50 280 V 180 H 150 V 100 H 300 V 220 H 380" />
                    <path d="M150 180 H 300" />
                </g>
                
                {/* Buildings */}
                <g className={`buildings ${buildingFill} ${buildingStroke} stroke-1`}>
                    <rect id="building-admin" x="30" y="30" width="80" height="60" className={`cursor-pointer transition-colors duration-200 ${buildingHover}`} onClick={() => handleBuildingClick('admin')} />
                    <rect id="building-health" x="30" y="200" width="100" height="80" className={`cursor-pointer transition-colors duration-200 ${buildingHover}`} onClick={() => handleBuildingClick('health')} />
                    <rect id="building-tech" x="180" y="20" width="150" height="70" className={`cursor-pointer transition-colors duration-200 ${buildingHover}`} onClick={() => handleBuildingClick('tech')} />
                    <rect id="building-library" x="180" y="130" width="90" height="90" className={`cursor-pointer transition-colors duration-200 ${buildingHover}`} onClick={() => handleBuildingClick('library')} />
                    <rect id="building-cafe" x="300" y="240" width="70" height="50" className={`cursor-pointer transition-colors duration-200 ${buildingHover}`} onClick={() => handleBuildingClick('cafe')} />
                </g>

                 {/* Labels */}
                <g className={`labels font-sans text-xs pointer-events-none ${theme.text}`} fontWeight="bold">
                    <text x="70" y="65" textAnchor="middle">Admin</text>
                    <text x="80" y="245" textAnchor="middle">Health Sci.</text>
                    <text x="255" y="60" textAnchor="middle">Sci. & Tech</text>
                    <text x="225" y="180" textAnchor="middle">Library</text>
                    <text x="335" y="270" textAnchor="middle">Cafeteria</text>
                </g>
            </svg>

            {selectedBuilding && (
                <Modal isOpen={!!selectedBuilding} onClose={() => setSelectedBuilding(null)} title={selectedBuilding.name}>
                    <p className={theme.textMuted}>{selectedBuilding.description}</p>
                </Modal>
            )}
        </div>
    );
};

export default InteractiveCampusMap;

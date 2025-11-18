import React from 'react';
import { Student, Department } from '../types';
import { useTheme } from '../hooks/useTheme';

interface DigitalIDCardProps {
    student: Student;
    department?: Department;
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ student, department }) => {
    const { theme } = useTheme();

    const qrCodeData = encodeURIComponent(JSON.stringify({
        studentId: student.studentId,
        name: student.name,
        department: department?.name || 'N/A',
    }));
    
    // Using an external API for QR code generation
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeData}&bgcolor=${theme.name === 'light' ? 'ffffff' : '374151'}&color=${theme.name === 'light' ? '000000' : 'ffffff'}&qzone=1`;

    return (
        <div className={`w-full max-w-sm mx-auto rounded-2xl p-6 shadow-2xl relative overflow-hidden ${theme.card.background} ${theme.card.border}`}
             style={{
                background: theme.name === 'faith' 
                    ? 'linear-gradient(135deg, #1e40af, #3b82f6)' 
                    : theme.card.background
             }}
        >
            {/* Background elements */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${theme.accent} opacity-10`}></div>
            <div className={`absolute -bottom-12 -left-8 w-40 h-40 rounded-full ${theme.accent} opacity-5`}></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                 <svg className={`w-10 h-10 ${theme.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"></path>
                </svg>
                <h2 className={`text-xl font-bold ${theme.text} tracking-tight`}>Crestview College</h2>
            </div>
            
            {/* Main Content */}
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <img
                        // Using a placeholder image for student photo
                        src={`https://picsum.photos/seed/${student.studentId}/200/200`}
                        alt="Student photograph"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-white/20 shadow-md"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className={`text-2xl font-bold ${theme.text}`}>{student.name}</h3>
                    <p className={`text-sm font-medium ${theme.accent}`}>{student.studentId}</p>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 flex justify-between items-end">
                <div>
                     <p className={`text-xs uppercase font-semibold ${theme.textMuted}`}>Department</p>
                     <p className={`text-sm font-medium ${theme.text}`}>{department?.name.split('(')[0] || 'N/A'}</p>
                     <p className={`text-xs uppercase font-semibold ${theme.textMuted} mt-2`}>Issued</p>
                     <p className={`text-sm font-medium ${theme.text}`}>{new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
                 <div className="p-1 bg-white rounded-md shadow-inner">
                    <img
                        src={qrCodeUrl}
                        alt="QR Code with student information"
                        className="w-20 h-20"
                    />
                </div>
            </div>
        </div>
    );
};

export default DigitalIDCard;

import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useTheme } from '../hooks/useTheme';
import { uploadCourseMaterial } from '../hooks/useApi';
import { Course } from '../types';

interface MaterialUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onUploadSuccess: () => void;
}

const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({ isOpen, onClose, course, onUploadSuccess }) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setFile(null);
            setError('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError('');
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must not exceed 10MB.');
                return;
            }
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                setError('Only PDF and DOCX files are allowed.');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !file || !course) {
            setError('Please provide a title and select a file.');
            return;
        }
        setLoading(true);
        setError('');
        
        const result = await uploadCourseMaterial(course.id, title, file);

        if (result.success) {
            onUploadSuccess();
            onClose();
        } else {
            setError(result.message || 'Failed to upload material.');
        }
        setLoading(false);
    };

    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Upload Material for ${course?.code}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className={`block text-sm font-medium ${theme.textMuted}`}>Material Title</label>
                    <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="materialFile" className={`block text-sm font-medium ${theme.textMuted}`}>File (PDF or DOCX, max 10MB)</label>
                    <input ref={fileInputRef} type="file" name="materialFile" id="materialFile" onChange={handleFileChange} accept=".pdf,.docx" className={`mt-1 block w-full text-sm ${theme.textMuted} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.hover}`} required />
                    {file && <p className={`mt-1 text-sm ${theme.textMuted}`}>Selected: {file.name}</p>}
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {loading ? 'Uploading...' : 'Upload Material'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
export default MaterialUploadModal;
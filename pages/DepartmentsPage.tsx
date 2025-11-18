

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi, getCurrentStaff, updateDepartmentImage } from '../hooks/useApi';
import { Department, StaffRole } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

interface DepartmentCardProps {
  department: Department;
  isAdmin: boolean;
  onImageUpload: (departmentId: string, file: File) => void;
  uploadStatus?: { status: 'uploading' | 'success' | 'error'; message: string };
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, isAdmin, onImageUpload, uploadStatus }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadStatus?.status === 'uploading';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(department.id, file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} hover:shadow-lg overflow-hidden flex flex-col`}>
      <div className="relative">
        <Link to={`/departments/${department.id}`} aria-label={`Learn more about ${department.name}`}>
          <img src={department.imageUrl} alt={department.name} className="w-full h-56 object-cover" loading="lazy" />
        </Link>
        
        {uploadStatus && (
          <div role="status" aria-live="polite" className={`absolute inset-0 flex items-center justify-center p-4 text-center text-white font-semibold transition-opacity duration-300 ${
            uploadStatus.status === 'success' ? 'bg-green-600/80' : 
            uploadStatus.status === 'error' ? 'bg-red-600/80' : 
            'bg-black/70'
          }`}>
            <div className="flex items-center">
              {isUploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
            />
            <button
              onClick={handleButtonClick}
              className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
              aria-label={`Change image for ${department.name}`}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Change Image'}
            </button>
          </>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className={`text-2xl font-bold ${theme.card.text} mb-2`}>
          <Link to={`/departments/${department.id}`} className="hover:underline">
            {department.name}
          </Link>
        </h3>
        <p className={`${theme.card.textMuted} leading-relaxed flex-grow`}>{department.description}</p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <Link to={`/departments/${department.id}`} className={`font-semibold ${theme.accent} hover:underline`}>
                View Details &rarr;
            </Link>
        </div>
      </div>
    </div>
  );
};

const DepartmentsPage: React.FC = () => {
  const { data: departments, loading, error, refetch } = useApi<Department[]>('/api/departments');
  const { theme } = useTheme();
  const currentStaff = getCurrentStaff();
  const [uploadStatus, setUploadStatus] = useState<Record<string, { status: 'uploading' | 'success' | 'error'; message: string } | undefined>>({});

  const handleImageUpload = async (departmentId: string, file: File) => {
    // Client-side validation moved from DepartmentCard
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setUploadStatus(prev => ({ ...prev, [departmentId]: { status: 'error', message: 'File is too large (max 2MB).' } }));
    } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadStatus(prev => ({ ...prev, [departmentId]: { status: 'error', message: 'Invalid file type (JPG, PNG, WEBP).' } }));
    } else {
        setUploadStatus(prev => ({ ...prev, [departmentId]: { status: 'uploading', message: 'Uploading...' } }));
        const result = await updateDepartmentImage(departmentId, file);
        if (result.success) {
          setUploadStatus(prev => ({ ...prev, [departmentId]: { status: 'success', message: 'Image Updated!' } }));
          refetch();
        } else {
          setUploadStatus(prev => ({ ...prev, [departmentId]: { status: 'error', message: result.message ?? 'Upload failed.' } }));
        }
    }

    // Clear the message after a few seconds
    setTimeout(() => {
        setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[departmentId];
            return newStatus;
        });
    }, 4000);
  };

  return (
    <PageWrapper
      title="Our Departments"
      subtitle="Explore the faculties that form the academic core of Crestview College."
    >
      {loading && <SkeletonGrid count={3} type="card" />}
      {error && <ErrorDisplay message={`Error loading departments: ${error}`} onRetry={refetch} />}
      {!loading && departments && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              isAdmin={currentStaff?.role === StaffRole.Admin}
              onImageUpload={handleImageUpload}
              uploadStatus={uploadStatus[dept.id]}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default DepartmentsPage;
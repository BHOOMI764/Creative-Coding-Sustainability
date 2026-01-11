import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import ImageUpload from '../common/ImageUpload';

interface ProjectFormProps {
  initialData?: {
    title: string;
    description: string;
    thumbnailUrl: string;
    repositoryUrl?: string;
    demoUrl?: string;
    teamName: string;
    teamDescription?: string;
    sdgs: number[];
  };
  isEditing?: boolean;
  projectId?: number;
  onSubmit?: (data: any) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  initialData,
  isEditing = false,
  projectId,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    repositoryUrl: initialData?.repositoryUrl || '',
    demoUrl: initialData?.demoUrl || '',
    teamName: initialData?.teamName || '',
    teamDescription: initialData?.teamDescription || '',
    sdgs: initialData?.sdgs || []
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        // Use custom onSubmit handler
        await onSubmit(formData);
      } else {
        // Default behavior
        const endpoint = isEditing 
          ? `${API_URL}/api/projects/${projectId}`
          : `${API_URL}/api/projects`;

        const method = isEditing ? 'put' : 'post';

        const response = await axios[method](endpoint, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.status === 201 || response.status === 200) {
          navigate('/student/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnailUrl: imageUrl
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Thumbnail
        </label>
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          currentImageUrl={formData.thumbnailUrl}
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Repository URL
        </label>
        <input
          type="url"
          value={formData.repositoryUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Demo URL
        </label>
        <input
          type="url"
          value={formData.demoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <input
          type="text"
          value={formData.teamName}
          onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Team Description
        </label>
        <textarea
          value={formData.teamDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, teamDescription: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={2}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : isEditing ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  );
};

export default ProjectForm; 
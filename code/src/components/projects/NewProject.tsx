import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ImageUpload from '../common/ImageUpload';

interface NewProjectForm {
  title: string;
  description: string;
  thumbnailUrl?: string;
  repositoryUrl: string;
  demoUrl: string;
  teamName: string;
  teamDescription: string;
  sdgs: string[];
  mediaUrls: string;
}

interface SDG {
  id: number;
  number: number;
  name: string;
  description: string;
  color: string;
}

const NewProject: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<NewProjectForm>();

  useEffect(() => {
    // Fetch available SDGs
    const fetchSDGs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/sdgs`);
        setSdgs(response.data);
      } catch (err) {
        console.error('Error fetching SDGs:', err);
        setError('Failed to load SDGs');
      }
    };

    fetchSDGs();
  }, []);

  const handleImageUploaded = (imageUrl: string) => {
    setThumbnailUrl(imageUrl);
  };

  const onSubmit = async (data: NewProjectForm) => {
    setLoading(true);
    setError(null);

    try {
      // Format mediaUrls from textarea into array
      const mediaUrlsArray = data.mediaUrls 
        ? data.mediaUrls.split('\n').filter(url => url.trim() !== '')
        : [];

      // Convert sdgs from string[] to number[]
      const sdgsArray = Array.isArray(data.sdgs) 
        ? data.sdgs.map(id => parseInt(id))
        : [];

      // Validate that either an image is uploaded or a URL is provided
      if (!thumbnailUrl && !data.thumbnailUrl?.trim()) {
        setError('Please upload an image or provide a thumbnail URL');
        setLoading(false);
        return;
      }

      const projectData = {
        title: data.title.trim(),
        description: data.description.trim(),
        thumbnailUrl: thumbnailUrl || data.thumbnailUrl?.trim() || '',
        repositoryUrl: data.repositoryUrl?.trim() || '',
        demoUrl: data.demoUrl?.trim() || '',
        teamName: data.teamName.trim(),
        teamDescription: data.teamDescription?.trim() || '',
        sdgs: sdgsArray,
        mediaUrls: mediaUrlsArray
      };

      console.log('Attempting to create project with data:', projectData);

      try {
        const response = await axios.post(
          `${API_URL}/api/student/projects`,
          projectData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Server response:', response);

        if (response.status === 201 && response.data) {
          console.log('Project created successfully:', response.data);
          navigate('/dashboard/student');
        } else {
          console.error('Unexpected response:', response);
          throw new Error('Unexpected response from server');
        }
      } catch (axiosError: any) {
        console.error('Axios error:', axiosError);
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        throw axiosError;
      }
    } catch (err: any) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to create project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Project Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Thumbnail
            </label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={thumbnailUrl}
              className="mt-1"
            />
            {!thumbnailUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">
                  Or provide a thumbnail URL:
                </p>
                <Input
                  placeholder="https://example.com/image.jpg"
                  {...register('thumbnailUrl')}
                  error={errors.thumbnailUrl?.message}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Repository URL"
            {...register('repositoryUrl')}
            error={errors.repositoryUrl?.message}
          />

          <Input
            label="Demo URL"
            {...register('demoUrl')}
            error={errors.demoUrl?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Team Name"
            {...register('teamName', { required: 'Team name is required' })}
            error={errors.teamName?.message}
          />

          <Input
            label="Team Description"
            {...register('teamDescription')}
            error={errors.teamDescription?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SDGs
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sdgs.map((sdg) => (
              <label key={sdg.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('sdgs')}
                  value={sdg.id}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{sdg.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URLs (One per line)
          </label>
          <textarea
            {...register('mediaUrls')}
            rows={3}
            placeholder="Enter media URLs, one per line"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard/student')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
          >
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProject; 
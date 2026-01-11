import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { API_URL } from '../../config';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Edit, Trash2 } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  repositoryUrl?: string;
  demoUrl?: string;
  teamName: string;
  sdgs: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  averageRating?: number;
}

const ProjectList: React.FC<{ endpoint?: string }> = ({ endpoint = '/api/projects' }) => {
  const { token, user } = useAuth();
  const { deleteProject } = useProjects();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; projectId: number | null; projectTitle: string }>({
    isOpen: false,
    projectId: null,
    projectTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, endpoint]);

  const handleDeleteProject = async () => {
    if (!showDeleteModal.projectId) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(showDeleteModal.projectId);
      setProjects(projects.filter(p => p.id !== showDeleteModal.projectId));
      setShowDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const canEditProject = (_project: Project) => {
    if (!user) return false;
    
    // Admin and faculty can edit any project
    if (user.role === 'admin' || user.role === 'faculty') return true;
    
    // Check if user is a team member (this would need to be added to the Project interface)
    // For now, we'll assume students can edit projects they created
    return user.role === 'student';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-2 text-gray-600">Check back later for new projects</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl">
          <div 
            className="relative group cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <img 
              src={project.thumbnailUrl || 'https://via.placeholder.com/600x400?text=No+Image'} 
              alt={project.title}
              className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View Project
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200">
                {project.title}
              </h3>
              {canEditProject(project) && (
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/edit`);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    title="Edit Project"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal({ isOpen: true, projectId: project.id, projectTitle: project.title });
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.sdgs.map((sdg) => (
                <span
                  key={sdg.id}
                  className="px-2 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: `${sdg.color}20`, color: sdg.color }}
                >
                  {sdg.name}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">By {project.teamName}</span>
              {project.averageRating && (
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
                  <span className="text-sm text-gray-500 mr-1">Rating:</span>
                  <span className="text-sm font-medium text-gray-700">{project.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <Button
              className="w-full mt-3 transition-all duration-200 hover:bg-blue-700"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>

    <Modal
      isOpen={showDeleteModal.isOpen}
      onClose={() => setShowDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}
      title="Delete Project"
    >
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete "{showDeleteModal.projectTitle}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className="flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Project</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
};

export default ProjectList; 
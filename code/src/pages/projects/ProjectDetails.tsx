import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { API_URL } from '../../config';
import { Star, Github, Globe, Calendar, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import ProjectFeedback from '../../components/projects/ProjectFeedback';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

interface SDG {
  id: number;
  name: string;
  color: string;
}

interface TeamMember {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members: TeamMember[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  repositoryUrl?: string;
  demoUrl?: string;
  teamId: number;
  team: Team;
  sdgs: SDG[];
  mediaUrls: string[];
  averageRating?: number;
  createdAt: string;
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { deleteProject } = useProjects();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleNextImage = () => {
    if (project && project.mediaUrls) {
      setCurrentImageIndex((prev) => 
        prev === project.mediaUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (project && project.mediaUrls) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.mediaUrls.length - 1 : prev - 1
      );
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const canEditProject = () => {
    if (!user || !project) return false;
    
    // Admin and faculty can edit any project
    if (user.role === 'admin' || user.role === 'faculty') return true;
    
    // Check if user is a team member
    if (project.team && project.team.members) {
      return project.team.members.some(member => member.id === user.id);
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-2xl w-full">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-2xl w-full">
          <h2 className="text-yellow-600 text-lg font-semibold mb-2">Project Not Found</h2>
          <p className="text-yellow-500">The project you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  const allImages = [project.thumbnailUrl, ...(project.mediaUrls || [])];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Project Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            {canEditProject() && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                  className="flex items-center space-x-2 bg-white bg-opacity-20 border-white text-white hover:bg-opacity-30"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.sdgs.map((sdg) => (
              <span
                key={sdg.id}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${sdg.color}20`, color: sdg.color }}
              >
                {sdg.name}
              </span>
            ))}
          </div>
        </div>

        {/* Project Images */}
        <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
          <img
            src={allImages[currentImageIndex]}
            alt={`${project.title} - Image ${currentImageIndex + 1}`}
            className="object-contain w-full h-[400px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x400?text=No+Image';
            }}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                ←
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                →
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          {/* Project Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{project.description}</p>
          </div>

          {/* Team Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Team</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">{project.team.name}</h3>
              {project.team.description && (
                <p className="text-gray-600 mb-4">{project.team.description}</p>
              )}
              <div className="flex flex-wrap gap-4">
                {project.team.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {member.firstName?.[0] || member.username[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.username}
                      </p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Links */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Project Links</h2>
            <div className="flex flex-wrap gap-4">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <Github className="w-5 h-5" />
                  <span>Repository</span>
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <Globe className="w-5 h-5" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>

          {/* Project Feedback */}
          <div className="mt-8">
            <ProjectFeedback projectId={Number(id)} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{project.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default ProjectDetails;
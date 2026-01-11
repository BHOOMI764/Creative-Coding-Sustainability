import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import ProjectForm from './ProjectForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Trash2, Edit } from 'lucide-react';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, updateProject, deleteProject } = useProjects();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const project = id ? getProjectById(parseInt(id)) : null;

  useEffect(() => {
    if (id && !project) {
      // Project not found, redirect to projects list
      navigate('/projects');
    }
  }, [id, project, navigate]);

  if (!project) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleUpdate = async (updatedProject: any) => {
    try {
      await updateProject(project.id, updatedProject);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async () => {
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

  const canEdit = user && (
    user.role === 'admin' || 
    user.role === 'faculty' || 
    ((project as any).team && (project as any).team.members && (project as any).team.members.some((member: any) => member.id === user.id))
  );

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-red-800">Access Denied</h2>
          <p className="text-red-600">You don't have permission to edit this project.</p>
          <Button 
            onClick={() => navigate(`/projects/${project.id}`)}
            className="mt-4"
          >
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  const initialData = {
    title: project.title,
    description: project.description,
    thumbnailUrl: project.thumbnailUrl,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    teamName: (project as any).team?.name || (project as any).teamName || '',
    teamDescription: (project as any).team?.description || '',
    sdgs: project.sdgs?.map((sdg: any) => sdg.id) || []
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Cancel</span>
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <ProjectForm
          initialData={initialData}
          isEditing={true}
          projectId={project.id}
          onSubmit={handleUpdate}
        />
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
              onClick={handleDelete}
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

export default EditProject;

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProjectList from '../../components/projects/ProjectList';

const ViewerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name || 'Guest'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Explore innovative projects from our community of creators.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Projects</h2>
        <ProjectList endpoint="/api/projects" />
      </div>
    </div>
  );
};

export default ViewerDashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button
          onClick={() => navigate('/dashboard/student/projects/new')}
          leftIcon={<Plus size={20} />}
        >
          New Project
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username || 'Student'}</h2>
        <p className="text-gray-600 mb-4">
          This is your student dashboard where you can manage your projects and track your progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">My Projects</h3>
          <p className="text-gray-600">View and manage your ongoing projects.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/dashboard/student/projects')}
          >
            View Projects
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Feedback Center</h3>
          <p className="text-gray-600">View and respond to comments from viewers and faculty.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/dashboard/student/feedback')}
          >
            View Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProjectList from '../../components/projects/ProjectList';
import Button from '../../components/ui/Button';

const StudentProjects: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button
          onClick={() => navigate('/dashboard/student/projects/new')}
          leftIcon={<Plus size={20} />}
        >
          New Project
        </Button>
      </div>

      <ProjectList />
    </div>
  );
};

export default StudentProjects; 
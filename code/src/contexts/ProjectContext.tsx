import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Project, SDG } from '../types';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

interface ProjectContextProps {
  projects: Project[];
  featuredProjects: Project[];
  sdgs: SDG[];
  loading: boolean;
  error: string | null;
  getProjectById: (id: number) => Project | undefined;
  getProjectsBySDG: (sdgId: number) => Project[];
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'averageRating'>) => Promise<void>;
  updateProject: (id: number, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, sdgsRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/sdgs`)
        ]);
        
        setProjects(projectsRes.data);
        setSdgs(sdgsRes.data);
        
        // Set featured projects (top 5 by rating)
        const featured = [...projectsRes.data]
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 5);
        setFeaturedProjects(featured);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProjectById = (id: number) => {
    return projects.find(project => project.id === id);
  };

  const getProjectsBySDG = (sdgId: number) => {
    return projects.filter(project => 
      project.sdgs.some(sdg => sdg.id === sdgId)
    );
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'averageRating'>) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/projects`, 
        project,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setProjects([...projects, res.data]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project.');
      throw err;
    }
  };

  const updateProject = async (id: number, project: Partial<Project>) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/projects/${id}`, 
        project,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setProjects(projects.map(p => p.id === id ? res.data : p));
      // Also update featured projects if it's in there
      setFeaturedProjects(featuredProjects.map(p => p.id === id ? res.data : p));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project.');
      throw err;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await axios.delete(
        `${API_URL}/api/projects/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setProjects(projects.filter(p => p.id !== id));
      setFeaturedProjects(featuredProjects.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project.');
      throw err;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      featuredProjects,
      sdgs,
      loading,
      error,
      getProjectById,
      getProjectsBySDG,
      createProject,
      updateProject,
      deleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
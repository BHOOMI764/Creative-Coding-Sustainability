import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  team?: {
    name: string;
    members?: Array<{
      username: string;
      role: string;
    }>;
  };
  createdAt: string;
}

interface Feedback {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  facultyName: string;
  projectTitle: string;
}

const FacultyDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('5');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Project[]>([]);
  const [projectFeedback, setProjectFeedback] = useState<Feedback[]>([]);

  // Redirect if not faculty
  useEffect(() => {
    if (!loading && (!user || user.role !== 'faculty')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/api/projects`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const fetchProjectFeedback = async (projectId: number) => {
    try {
      if (!token) {
        console.error('No token available for feedback fetch');
        toast.error('Authentication required');
        return;
      }
      
      console.log('Fetching feedback for project:', projectId);
      console.log('Using token:', token ? 'Present' : 'Missing');
      console.log('Token value:', token);
      console.log('User:', user);
      console.log('API URL:', `${API_URL}/api/projects/${projectId}/feedback`);
      
      // Test token validity first
      try {
        const testResponse = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Token is valid, user:', testResponse.data);
      } catch (testErr: any) {
        console.error('Token validation failed:', testErr.response?.data);
        toast.error('Authentication expired. Please log in again.');
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/projects/${projectId}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Feedback response:', response.data);
      setProjectFeedback(response.data);
    } catch (err: any) {
      console.error('Error fetching project feedback:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load feedback history';
      console.error('Error details:', {
        status: err.response?.status,
        message: errorMessage,
        data: err.response?.data
      });
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    await fetchProjectFeedback(project.id);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !token) {
      toast.error('No project selected or not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/feedback`,
        {
          projectId: selectedProject.id,
          content: feedback,
          rating: parseInt(rating),
          isPrivate: isPrivate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Feedback submission response:', response.data);

      // Add new feedback to the list
      await fetchProjectFeedback(selectedProject.id);
      
      // Reset form
      setFeedback('');
      setRating('5');
      setIsPrivate(false);
      setSelectedProject(null); // Close the modal after successful submission

      toast.success('Feedback submitted successfully');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit feedback';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Projects</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Faculty Dashboard</h1>
      
      {/* Projects Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Review Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 flex flex-col">
              <p className="text-gray-400 italic">No projects available for review</p>
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img 
                  src={project.thumbnailUrl} 
                  alt={project.title}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {project.description.length > 100 
                      ? `${project.description.substring(0, 100)}...` 
                      : project.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Team: {project.team?.name || 'Unnamed Team'}
                    </span>
                    <button
                      onClick={() => handleProjectSelect(project)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Review
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold">{selectedProject.title}</h2>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmitFeedback} className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star.toString())}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={`${
                            parseInt(rating) >= star
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    required
                    placeholder="Enter your feedback here..."
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Make this feedback private
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting || !feedback.trim()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>

              {/* Previous Feedback */}
              {projectFeedback.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Previous Feedback</h3>
                  <div className="space-y-4">
                    {projectFeedback.map((feedback) => (
                      <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{feedback.facultyName}</span>
                            <div className="flex">
                              {Array.from({ length: feedback.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className="text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{feedback.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-400 italic">No recent reviews</p>
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500">
                    Last reviewed: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleProjectSelect(project)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Review Again
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
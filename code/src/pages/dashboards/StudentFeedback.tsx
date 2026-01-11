import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import axios from 'axios';

interface FeedbackItem {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  facultyName: string;
  project: {
    id: number;
    title: string;
    thumbnailUrl: string;
  };
}

const StudentFeedback: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_URL}/api/student/feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setFeedback(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
            <h3 className="text-red-800 font-medium">Error Loading Feedback</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Feedback Center</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">No Feedback Yet</h2>
          <p className="text-gray-600">
            You haven't received any feedback on your projects yet. Keep working on your projects and faculty members will provide feedback soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Comments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Recent Comments</h2>
          </div>
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.project.title}</h3>
                    <p className="text-sm text-gray-500">From {item.facultyName}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{item.content}</p>
                <div className="flex items-center mt-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Ratings Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Project Ratings</h2>
          </div>
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={item.project.thumbnailUrl} 
                    alt={item.project.title}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm"
                  />
                  <span className="font-medium text-gray-900">{item.project.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{item.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';

interface Feedback {
  id: number;
  content: string;
  rating: number;
  isPrivate: boolean;
  createdAt: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ProjectFeedbackProps {
  projectId: number;
}

const ProjectFeedback: React.FC<ProjectFeedbackProps> = ({ projectId }) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { user, token } = useAuth();

  const fetchFeedback = async () => {
    try {
      console.log('Fetching feedback for project:', projectId);
      const response = await axios.get(`${API_URL}/api/projects/${projectId}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Received feedback:', response.data);
      setFeedback(response.data);
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch feedback';
      console.error('Error fetching feedback:', err);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchFeedback();
    }
  }, [projectId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSubmitSuccess(false);

    try {
      console.log('Submitting feedback:', {
        projectId,
        content: newFeedback,
        rating,
        isPrivate
      });

      const response = await axios.post(`${API_URL}/api/feedback`, {
        projectId,
        content: newFeedback,
        rating,
        isPrivate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Feedback submitted successfully:', response.data);
      
      setNewFeedback('');
      setRating(5);
      setIsPrivate(false);
      setSubmitSuccess(true);
      
      // Refresh the feedback list
      await fetchFeedback();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit feedback';
      console.error('Error submitting feedback:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-600">
        Please log in to view and submit feedback.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Feedback</h2>
      
      {user?.role === 'faculty' && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Feedback
            </label>
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              required
              disabled={isSubmitting}
              placeholder="Enter your feedback here..."
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} Star{value !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                Private Feedback
              </label>
            </div>
          </div>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {submitSuccess && (
            <p className="text-green-600 text-sm">Feedback submitted successfully!</p>
          )}
          
          <button
            type="submit"
            className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
      
      <div className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {item.firstName && item.lastName
                    ? `${item.firstName} ${item.lastName}`
                    : item.username}
                  <span className="ml-2 text-sm text-gray-500">
                    ({item.role})
                  </span>
                </h3>
                <p className="mt-1">{item.content}</p>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">
                  {'★'.repeat(item.rating)}
                  {'☆'.repeat(5 - item.rating)}
                </span>
                {item.isPrivate && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Private)
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        
        {feedback.length === 0 && (
          <p className="text-gray-500 text-center">
            No feedback available yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectFeedback; 
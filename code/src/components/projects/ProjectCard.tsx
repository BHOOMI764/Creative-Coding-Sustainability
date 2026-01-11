import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Github } from 'lucide-react';
import { Project } from '../../types';
import SDGBadge from './SDGBadge';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, featured = false }) => {
  const { id, title, description, thumbnailUrl, repositoryUrl, sdgs, averageRating } = project;
  
  return (
    <div className={`
      bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300
      hover:shadow-xl hover:-translate-y-2
      ${featured ? 'ring-2 ring-blue-500' : ''}
    `}>
      <div className="relative">
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-56 object-cover"
        />
        
        {featured && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white py-1 px-2 rounded-md text-xs font-semibold">
            Featured
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {sdgs.slice(0, 3).map((sdg) => (
            <SDGBadge key={sdg.id} sdg={sdg} />
          ))}
          {sdgs.length > 3 && (
            <span className="bg-gray-700 text-white text-xs font-medium rounded-full flex items-center justify-center h-6 w-6">
              +{sdgs.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{title}</h3>
          
          {averageRating != null && (
            <div className="flex items-center">
              <Star size={16} className="text-amber-400 mr-1" fill="currentColor" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>
        
        <div className="flex justify-between items-center">
          <Link 
            to={`/projects/${id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </Link>
          
          {repositoryUrl && (
            <a 
              href={repositoryUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <Github size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
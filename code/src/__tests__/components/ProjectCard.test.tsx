import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from '../../components/projects/ProjectCard';
import { Project } from '../../types';

const mockProject: Project = {
  id: 1,
  title: 'Smart Water Management',
  description: 'AI-powered water conservation system for urban areas',
  thumbnailUrl: 'https://example.com/image.jpg',
  repositoryUrl: 'https://github.com/example/repo',
  demoUrl: 'https://demo.example.com',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  teamId: 1,
  averageRating: 4.8,
  sdgs: [
    {
      id: 6,
      number: 6,
      name: 'Clean Water',
      description: 'Ensure availability and sustainable management of water',
      iconPath: '/icons/sdg-6.svg',
      color: '#26BDE2',
    },
  ],
  mediaUrls: ['https://example.com/media1.jpg'],
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProjectCard', () => {
  it('should render project information correctly', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Smart Water Management')).toBeInTheDocument();
    expect(screen.getByText('AI-powered water conservation system for urban areas')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('should display SDG badges', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Clean Water')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onViewProject = jest.fn();
    renderWithRouter(<ProjectCard project={mockProject} onViewProject={onViewProject} />);

    const card = screen.getByTestId('project-card');
    fireEvent.click(card);

    expect(onViewProject).toHaveBeenCalledWith(mockProject.id);
  });

  it('should render external links when available', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);

    const repoLink = screen.getByRole('link', { name: /repository/i });
    const demoLink = screen.getByRole('link', { name: /demo/i });

    expect(repoLink).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
  });

  it('should handle missing external links gracefully', () => {
    const projectWithoutLinks = {
      ...mockProject,
      repositoryUrl: undefined,
      demoUrl: undefined,
    };

    renderWithRouter(<ProjectCard project={projectWithoutLinks} />);

    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument();
  });

  it('should display correct rating stars', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);

    // Check for filled stars (rating 4.8 should show 4-5 stars)
    const stars = screen.getAllByTestId(/star-/);
    expect(stars).toHaveLength(5);
  });

  it('should handle image loading errors', () => {
    renderWithRouter(<ProjectCard project={mockProject} />);

    const image = screen.getByAltText('Smart Water Management');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');

    // Simulate image load error
    fireEvent.error(image);

    // Should show placeholder or fallback
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });
});

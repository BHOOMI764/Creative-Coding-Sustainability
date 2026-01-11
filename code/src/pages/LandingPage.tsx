import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ChevronRight, Github, Globe, BarChart2 } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import ProjectCard from '../components/projects/ProjectCard';
import SDGBadge from '../components/projects/SDGBadge';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const { featuredProjects, sdgs, loading } = useProjects();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">CreativeCodingHub</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            <a href="#projects" className="text-gray-600 hover:text-blue-600 transition-colors">Projects</a>
            <a href="#sdgs" className="text-gray-600 hover:text-blue-600 transition-colors">SDGs</a>
            <a href="#stats" className="text-gray-600 hover:text-blue-600 transition-colors">Impact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Creative Coding for Sustainable Development
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Showcasing student projects that leverage Python coding skills to address global challenges aligned with UN Sustainable Development Goals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img 
              src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Students collaborating" 
              className="rounded-lg shadow-2xl w-full max-w-lg object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About the Platform</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The Creative Coding Hub connects academic learning with real-world impact by showcasing Python-based solutions to global challenges.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <GraduationCap className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Educational Excellence</h3>
              <p className="text-gray-600">
                Showcasing creative applications of Python programming skills learned in academic courses.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Sustainable Development</h3>
              <p className="text-gray-600">
                Connecting student projects with UN Sustainable Development Goals to promote global impact.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Github className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Technical Innovation</h3>
              <p className="text-gray-600">
                Encouraging the use of modern tools, libraries, and collaborative development practices.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Projects</h2>
              <p className="text-lg text-gray-600">
                Explore innovative coding solutions created by student teams
              </p>
            </div>
            <Link to="/login" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <span>View All Projects</span>
              <ChevronRight size={18} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured={true} />
              ))}
              {featuredProjects.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No featured projects yet. Login or register to submit your project!
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* SDGs Section */}
      <section id="sdgs" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Sustainable Development Goals</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform aligns student projects with UN Sustainable Development Goals to promote global impact.
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 justify-items-center">
            {sdgs.map((sdg) => (
              <div key={sdg.id} className="flex flex-col items-center">
                <SDGBadge sdg={sdg} size="lg" />
                <span className="text-xs text-center mt-2 font-medium text-gray-700">{sdg.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a 
              href="https://sdgs.un.org/goals" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn more about UN SDGs
              <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section id="stats" className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Impact</h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              Measuring our collective contribution to sustainable development through coding innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
              <p className="text-blue-100">Student Projects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">17</div>
              <p className="text-blue-100">SDGs Addressed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <p className="text-blue-100">Faculty Mentors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">20+</div>
              <p className="text-blue-100">Partner Institutions</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Showcase Your Project?</h2>
              <p className="text-gray-600 mb-6">
                Join our platform to share your Python coding projects, connect with the SDG community, and make a real impact on global challenges.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Login to Your Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Team collaboration" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">CreativeCodingHub</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Connecting creative coding with sustainable development goals through student innovation.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://github.com/" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-blue-400 text-sm">About</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-blue-400 text-sm">Projects</a></li>
                <li><a href="#sdgs" className="text-gray-400 hover:text-blue-400 text-sm">SDGs</a></li>
                <li><a href="#stats" className="text-gray-400 hover:text-blue-400 text-sm">Impact</a></li>
              </ul>
            </div>
            
            
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>123 Innovation Campus, Tech City, Country</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <a href="mailto:contact@creativecoding.edu" className="hover:text-blue-400">bhoomicat2005@gmail.com</a>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📱</span>
                  <span>9869343406</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Creative Coding Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
export type UserRole = 'viewer' | 'student' | 'faculty' | 'admin' | 'management';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface SDG {
  id: number;
  number: number;
  name: string;
  description: string;
  iconPath: string;
  color: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  repositoryUrl?: string;
  demoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  teamId: number;
  averageRating?: number;
  sdgs: SDG[];
  mediaUrls: string[];
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members: User[];
  projects: Project[];
}

export interface Feedback {
  id: number;
  content: string;
  rating: number;
  createdAt: Date;
  userId: number;
  projectId: number;
  user?: User;
}
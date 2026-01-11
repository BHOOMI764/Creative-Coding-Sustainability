import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database initialization
let db;
const initializeDB = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('viewer', 'student', 'faculty')),
        firstName TEXT,
        lastName TEXT,
        profileImage TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        role TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teamId) REFERENCES teams (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE (teamId, userId)
      );
      
      CREATE TABLE IF NOT EXISTS sdgs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        iconPath TEXT,
        color TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnailUrl TEXT NOT NULL,
        repositoryUrl TEXT,
        demoUrl TEXT,
        teamId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teamId) REFERENCES teams (id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS project_sdgs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        sdgId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (sdgId) REFERENCES sdgs (id) ON DELETE CASCADE,
        UNIQUE (projectId, sdgId)
      );
      
      CREATE TABLE IF NOT EXISTS project_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        mediaUrl TEXT NOT NULL,
        mediaType TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );
      
      DROP TABLE IF EXISTS feedback;
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        isPrivate BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (projectId) REFERENCES projects (id)
      );
    `);
    
    // Insert SDGs if they don't exist
    const sdgsCount = await db.get('SELECT COUNT(*) as count FROM sdgs');
    
    if (sdgsCount.count === 0) {
      const sdgs = [
        { number: 1, name: 'No Poverty', description: 'End poverty in all its forms everywhere', color: '#E5243B' },
        { number: 2, name: 'Zero Hunger', description: 'End hunger, achieve food security and improved nutrition', color: '#DDA63A' },
        { number: 3, name: 'Good Health', description: 'Ensure healthy lives and promote well-being for all', color: '#4C9F38' },
        { number: 4, name: 'Quality Education', description: 'Ensure inclusive and equitable quality education', color: '#C5192D' },
        { number: 5, name: 'Gender Equality', description: 'Achieve gender equality and empower all women and girls', color: '#FF3A21' },
        { number: 6, name: 'Clean Water', description: 'Ensure access to water and sanitation for all', color: '#26BDE2' },
        { number: 7, name: 'Clean Energy', description: 'Ensure access to affordable, reliable, sustainable energy', color: '#FCC30B' },
        { number: 8, name: 'Good Jobs', description: 'Promote inclusive and sustainable economic growth', color: '#A21942' },
        { number: 9, name: 'Innovation', description: 'Build resilient infrastructure, promote sustainable industrialization', color: '#FD6925' },
        { number: 10, name: 'Reduced Inequalities', description: 'Reduce inequality within and among countries', color: '#DD1367' },
        { number: 11, name: 'Sustainable Cities', description: 'Make cities inclusive, safe, resilient and sustainable', color: '#FD9D24' },
        { number: 12, name: 'Responsible Consumption', description: 'Ensure sustainable consumption and production patterns', color: '#BF8B2E' },
        { number: 13, name: 'Climate Action', description: 'Take urgent action to combat climate change and its impacts', color: '#3F7E44' },
        { number: 14, name: 'Life Below Water', description: 'Conserve and sustainably use the oceans, seas and marine resources', color: '#0A97D9' },
        { number: 15, name: 'Life On Land', description: 'Sustainably manage forests, combat desertification', color: '#56C02B' },
        { number: 16, name: 'Peace & Justice', description: 'Promote just, peaceful and inclusive societies', color: '#00689D' },
        { number: 17, name: 'Partnerships', description: 'Revitalize the global partnership for sustainable development', color: '#19486A' }
      ];
      
      const insertSDGStmt = await db.prepare(
        'INSERT INTO sdgs (number, name, description, color) VALUES (?, ?, ?, ?)'
      );
      
      for (const sdg of sdgs) {
        await insertSDGStmt.run(sdg.number, sdg.name, sdg.description, sdg.color);
      }
      
      await insertSDGStmt.finalize();
    }
    
    // Create admin user if it doesn't exist
    const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@example.com', hashedPassword, 'admin']
      );
    }
    
    await seedFeedbackData();
    await seedSampleProjects();
    await updateProjectImages();
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
};

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware - URL:', req.url, 'Auth header:', authHeader, 'Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('Token verified for user:', user.id, 'role:', user.role);
    req.user = user;
    next();
  });
};

// Routes
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  try {
    console.log('Registration attempt:', { username, email, role });
    
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Validate role
    const validRoles = ['viewer', 'student', 'faculty'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Creating new user with hashed password');
    
    // Create user
    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    
    // Get created user
    const user = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', [result.lastID]);
    
    console.log('User created successfully:', user);
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('Login attempt for email:', email);
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found, verifying password');
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verified, generating token');
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', userWithoutPassword);
    
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, role, firstName, lastName, profileImage, createdAt, updatedAt FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SDG Routes
app.get('/api/sdgs', async (req, res) => {
  try {
    const sdgs = await db.all('SELECT * FROM sdgs ORDER BY number');
    res.json(sdgs);
  } catch (err) {
    console.error('Error fetching SDGs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Projects Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.all(`
      SELECT 
        p.id, p.title, p.description, p.thumbnailUrl, p.repositoryUrl, p.demoUrl, 
        p.teamId, p.createdAt, p.updatedAt,
        AVG(f.rating) as averageRating
      FROM projects p
      LEFT JOIN feedback f ON p.id = f.projectId
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);
    
    // Get SDGs for each project
    for (const project of projects) {
      const sdgs = await db.all(`
        SELECT s.*
        FROM sdgs s
        JOIN project_sdgs ps ON s.id = ps.sdgId
        WHERE ps.projectId = ?
      `, [project.id]);
      
      const media = await db.all(`
        SELECT mediaUrl
        FROM project_media
        WHERE projectId = ?
      `, [project.id]);
      
      project.sdgs = sdgs;
      project.mediaUrls = media.map(m => m.mediaUrl);
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.get(`
      SELECT 
        p.id, p.title, p.description, p.thumbnailUrl, p.repositoryUrl, p.demoUrl, 
        p.teamId, p.createdAt, p.updatedAt,
        AVG(f.rating) as averageRating
      FROM projects p
      LEFT JOIN feedback f ON p.id = f.projectId
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get SDGs
    const sdgs = await db.all(`
      SELECT s.*
      FROM sdgs s
      JOIN project_sdgs ps ON s.id = ps.sdgId
      WHERE ps.projectId = ?
    `, [project.id]);
    
    // Get media
    const media = await db.all(`
      SELECT mediaUrl
      FROM project_media
      WHERE projectId = ?
    `, [project.id]);
    
    // Get team
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [project.teamId]);
    
    // Get team members
    const teamMembers = await db.all(`
      SELECT u.id, u.username, u.firstName, u.lastName, u.profileImage, tm.role
      FROM users u
      JOIN team_members tm ON u.id = tm.userId
      WHERE tm.teamId = ?
    `, [team.id]);
    
    // Get feedback
    const feedback = await db.all(`
      SELECT 
        f.id, f.content, f.rating, f.createdAt, f.userId,
        u.username, u.firstName, u.lastName, u.profileImage
      FROM feedback f
      JOIN users u ON f.userId = u.id
      WHERE f.projectId = ? AND f.isPrivate = 0
      ORDER BY f.createdAt DESC
    `, [project.id]);
    
    project.sdgs = sdgs;
    project.mediaUrls = media.map(m => m.mediaUrl);
    project.team = {
      ...team,
      members: teamMembers
    };
    project.feedback = feedback;
    
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route for creating projects
app.post('/api/projects', authenticateToken, async (req, res) => {
  const { title, description, thumbnailUrl, repositoryUrl, demoUrl, teamId, sdgs, mediaUrls } = req.body;
  
  try {
    // Validate user role
    if (!['student', 'faculty', 'admin', 'management'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to create projects' });
    }
    
    // Create project
    const result = await db.run(
      `INSERT INTO projects 
        (title, description, thumbnailUrl, repositoryUrl, demoUrl, teamId) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, thumbnailUrl, repositoryUrl, demoUrl, teamId]
    );
    
    const projectId = result.lastID;
    
    // Add SDGs
    if (sdgs && sdgs.length > 0) {
      const sdgStatement = await db.prepare(
        'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)'
      );
      
      for (const sdgId of sdgs) {
        await sdgStatement.run(projectId, sdgId);
      }
      
      await sdgStatement.finalize();
    }
    
    // Add media
    if (mediaUrls && mediaUrls.length > 0) {
      const mediaStatement = await db.prepare(
        'INSERT INTO project_media (projectId, mediaUrl, mediaType) VALUES (?, ?, ?)'
      );
      
      for (const mediaUrl of mediaUrls) {
        // Determine media type based on URL
        const mediaType = mediaUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? 'image' : 'video';
        await mediaStatement.run(projectId, mediaUrl, mediaType);
      }
      
      await mediaStatement.finalize();
    }
    
    // Get the created project
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project endpoint
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify project exists
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to update this project
    // Allow if user is admin, faculty, or a team member of the project
    let hasPermission = false;
    
    if (req.user.role === 'admin' || req.user.role === 'faculty') {
      hasPermission = true;
    } else {
      // Check if user is a team member
      const teamMember = await db.get(`
        SELECT tm.* 
        FROM team_members tm
        JOIN projects p ON tm.teamId = p.teamId
        WHERE p.id = ? AND tm.userId = ?
      `, [id, req.user.id]);
      hasPermission = !!teamMember;
    }

    if (!hasPermission) {
      return res.status(403).json({ message: 'Unauthorized to update this project' });
    }

    // Update project
    await db.run(`
      UPDATE projects 
      SET title = ?, description = ?, thumbnailUrl = ?, 
          repositoryUrl = ?, demoUrl = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      updates.title || project.title,
      updates.description || project.description,
      updates.thumbnailUrl || project.thumbnailUrl,
      updates.repositoryUrl || project.repositoryUrl,
      updates.demoUrl || project.demoUrl,
      id
    ]);

    // Update SDGs if provided
    if (updates.sdgs) {
      await db.run('DELETE FROM project_sdgs WHERE projectId = ?', [id]);
      const sdgStatement = await db.prepare(
        'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)'
      );
      for (const sdgId of updates.sdgs) {
        await sdgStatement.run(id, sdgId);
      }
      await sdgStatement.finalize();
    }

    // Update media if provided
    if (updates.mediaUrls) {
      await db.run('DELETE FROM project_media WHERE projectId = ?', [id]);
      const mediaStatement = await db.prepare(
        'INSERT INTO project_media (projectId, mediaUrl, mediaType) VALUES (?, ?, ?)'
      );
      for (const mediaUrl of updates.mediaUrls) {
        const mediaType = mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video';
        await mediaStatement.run(id, mediaUrl, mediaType);
      }
      await mediaStatement.finalize();
    }

    // Get updated project with all related data
    const updatedProject = await db.get(`
      SELECT 
        p.id, p.title, p.description, p.thumbnailUrl, p.repositoryUrl, p.demoUrl, 
        p.teamId, p.createdAt, p.updatedAt,
        AVG(f.rating) as averageRating
      FROM projects p
      LEFT JOIN feedback f ON p.id = f.projectId
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    // Get SDGs
    const sdgs = await db.all(`
      SELECT s.*
      FROM sdgs s
      JOIN project_sdgs ps ON s.id = ps.sdgId
      WHERE ps.projectId = ?
    `, [id]);

    // Get media
    const media = await db.all(`
      SELECT mediaUrl
      FROM project_media
      WHERE projectId = ?
    `, [id]);

    // Get team
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [project.teamId]);

    updatedProject.sdgs = sdgs;
    updatedProject.mediaUrls = media.map(m => m.mediaUrl);
    updatedProject.teamName = team.name;

    res.json(updatedProject);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project endpoint
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify project exists
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to delete this project
    // Allow if user is admin, faculty, or a team member of the project
    let hasPermission = false;
    
    if (req.user.role === 'admin' || req.user.role === 'faculty') {
      hasPermission = true;
    } else {
      // Check if user is a team member
      const teamMember = await db.get(`
        SELECT tm.* 
        FROM team_members tm
        JOIN projects p ON tm.teamId = p.teamId
        WHERE p.id = ? AND tm.userId = ?
      `, [id, req.user.id]);
      hasPermission = !!teamMember;
    }

    if (!hasPermission) {
      return res.status(403).json({ message: 'Unauthorized to delete this project' });
    }

    // Delete project (cascade will handle related records)
    await db.run('DELETE FROM projects WHERE id = ?', [id]);

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Feedback routes
app.post('/api/projects/:id/feedback', authenticateToken, async (req, res) => {
  const { content, rating, isPrivate = false } = req.body;
  const projectId = req.params.id;
  
  try {
    // Validate project exists
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Create feedback
    const result = await db.run(
      'INSERT INTO feedback (content, rating, userId, projectId, isPrivate) VALUES (?, ?, ?, ?, ?)',
      [content, rating, req.user.id, projectId, isPrivate ? 1 : 0]
    );
    
    const feedback = await db.get('SELECT * FROM feedback WHERE id = ?', [result.lastID]);
    
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Todo Routes
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await db.all(
      'SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
  const { title } = req.body;
  
  try {
    const result = await db.run(
      'INSERT INTO todos (title, userId) VALUES (?, ?)',
      [title, req.user.id]
    );
    
    const todo = await db.get('SELECT * FROM todos WHERE id = ?', [result.lastID]);
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  try {
    const todo = await db.get('SELECT * FROM todos WHERE id = ? AND userId = ?', [id, req.user.id]);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await db.run(
      'UPDATE todos SET completed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [completed, id]
    );
    
    const updatedTodo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const todo = await db.get('SELECT * FROM todos WHERE id = ? AND userId = ?', [id, req.user.id]);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await db.run('DELETE FROM todos WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Project Routes
app.get('/api/student/projects', authenticateToken, async (req, res) => {
  try {
    // Get projects where the user is a team member
    const projects = await db.all(`
      SELECT DISTINCT
        p.id, p.title, p.description, p.thumbnailUrl, p.repositoryUrl, p.demoUrl, 
        p.teamId, p.createdAt, p.updatedAt,
        AVG(f.rating) as averageRating
      FROM projects p
      JOIN team_members tm ON p.teamId = tm.teamId
      LEFT JOIN feedback f ON p.id = f.projectId
      WHERE tm.userId = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `, [req.user.id]);
    
    // Get SDGs for each project
    for (const project of projects) {
      const sdgs = await db.all(`
        SELECT s.*
        FROM sdgs s
        JOIN project_sdgs ps ON s.id = ps.sdgId
        WHERE ps.projectId = ?
      `, [project.id]);
      
      const team = await db.get('SELECT * FROM teams WHERE id = ?', [project.teamId]);
      
      project.sdgs = sdgs;
      project.teamName = team.name;
      project.teamDescription = team.description;
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/student/projects', authenticateToken, async (req, res) => {
  const { title, description, thumbnailUrl, repositoryUrl, demoUrl, teamName, teamDescription, sdgs, mediaUrls } = req.body;
  
  console.log('Received project creation request:', {
    title,
    description: description?.substring(0, 50) + '...',
    teamName,
    sdgsCount: sdgs?.length,
    mediaUrlsCount: mediaUrls?.length,
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });

  try {
    // Validate user role
    if (req.user.role !== 'student') {
      console.log('Access denied - non-student role:', req.user.role);
      return res.status(403).json({ message: 'Only students can create projects' });
    }

    // Validate required fields
    if (!title || !description || !thumbnailUrl || !teamName) {
      console.log('Missing required fields:', {
        hasTitle: !!title,
        hasDescription: !!description,
        hasThumbnail: !!thumbnailUrl,
        hasTeamName: !!teamName
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Start transaction
    console.log('Starting transaction');
    await db.run('BEGIN TRANSACTION');

    try {
      // Create team first
      console.log('Creating team:', { teamName, teamDescription });
      const teamResult = await db.run(
        'INSERT INTO teams (name, description) VALUES (?, ?)',
        [teamName, teamDescription || '']
      );
      const teamId = teamResult.lastID;
      console.log('Team created with ID:', teamId);

      // Add the student as a team member
      console.log('Adding student as team member:', { userId: req.user.id, teamId });
      await db.run(
        'INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)',
        [teamId, req.user.id, 'leader']
      );

      // Create project
      console.log('Creating project');
      const projectResult = await db.run(
        `INSERT INTO projects 
          (title, description, thumbnailUrl, repositoryUrl, demoUrl, teamId) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, thumbnailUrl, repositoryUrl || '', demoUrl || '', teamId]
      );
      
      const projectId = projectResult.lastID;
      console.log('Project created with ID:', projectId);
      
      // Add SDGs
      if (sdgs && sdgs.length > 0) {
        console.log('Adding SDGs:', sdgs);
        const sdgStatement = await db.prepare(
          'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)'
        );
        
        for (const sdgId of sdgs) {
          await sdgStatement.run(projectId, sdgId);
        }
        
        await sdgStatement.finalize();
      }
      
      // Add media
      if (mediaUrls && mediaUrls.length > 0) {
        console.log('Adding media URLs:', mediaUrls);
        const mediaStatement = await db.prepare(
          'INSERT INTO project_media (projectId, mediaUrl, mediaType) VALUES (?, ?, ?)'
        );
        
        for (const mediaUrl of mediaUrls) {
          const mediaType = mediaUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? 'image' : 'video';
          await mediaStatement.run(projectId, mediaUrl, mediaType);
        }
        
        await mediaStatement.finalize();
      }

      // Commit transaction
      console.log('Committing transaction');
      await db.run('COMMIT');
      
      // Get the created project with all its details
      const project = await db.get(`
        SELECT 
          p.*,
          t.name as teamName,
          t.description as teamDescription
        FROM projects p
        JOIN teams t ON p.teamId = t.id
        WHERE p.id = ?
      `, [projectId]);

      // Get SDGs
      project.sdgs = await db.all(`
        SELECT s.*
        FROM sdgs s
        JOIN project_sdgs ps ON s.id = ps.sdgId
        WHERE ps.projectId = ?
      `, [projectId]);

      // Get media
      project.mediaUrls = await db.all(`
        SELECT mediaUrl
        FROM project_media
        WHERE projectId = ?
      `, [projectId]);

      console.log('Successfully created project:', {
        id: project.id,
        title: project.title,
        teamName: project.teamName
      });

      res.status(201).json(project);
    } catch (err) {
      console.error('Error during transaction:', err);
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ 
      message: 'Failed to create project',
      error: err.message 
    });
  }
});

app.put('/api/student/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify project exists and student has access
    const project = await db.get(`
      SELECT p.* 
      FROM projects p
      JOIN teams t ON p.teamId = t.id
      JOIN team_members tm ON t.id = tm.teamId
      WHERE p.id = ? AND tm.userId = ?
    `, [id, req.user.id]);

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Update project
    await db.run(`
      UPDATE projects 
      SET title = ?, description = ?, thumbnailUrl = ?, 
          repositoryUrl = ?, demoUrl = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      updates.title || project.title,
      updates.description || project.description,
      updates.thumbnailUrl || project.thumbnailUrl,
      updates.repositoryUrl || project.repositoryUrl,
      updates.demoUrl || project.demoUrl,
      id
    ]);

    // Update SDGs if provided
    if (updates.sdgs) {
      await db.run('DELETE FROM project_sdgs WHERE projectId = ?', [id]);
      const sdgStatement = await db.prepare(
        'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)'
      );
      for (const sdgId of updates.sdgs) {
        await sdgStatement.run(id, sdgId);
      }
      await sdgStatement.finalize();
    }

    // Update media if provided
    if (updates.mediaUrls) {
      await db.run('DELETE FROM project_media WHERE projectId = ?', [id]);
      const mediaStatement = await db.prepare(
        'INSERT INTO project_media (projectId, mediaUrl, mediaType) VALUES (?, ?, ?)'
      );
      for (const mediaUrl of updates.mediaUrls) {
        const mediaType = mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video';
        await mediaStatement.run(id, mediaUrl, mediaType);
      }
      await mediaStatement.finalize();
    }

    // Get updated project
    const updatedProject = await db.get(`
      SELECT 
        p.*,
        t.name as teamName,
        t.description as teamDescription
      FROM projects p
      JOIN teams t ON p.teamId = t.id
      WHERE p.id = ?
    `, [id]);

    updatedProject.sdgs = await db.all(`
      SELECT s.*
      FROM sdgs s
      JOIN project_sdgs ps ON s.id = ps.sdgId
      WHERE ps.projectId = ?
    `, [id]);

    updatedProject.media = await db.all(`
      SELECT mediaUrl, mediaType
      FROM project_media
      WHERE projectId = ?
    `, [id]);

    res.json(updatedProject);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/student/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify project exists and student has access
    const project = await db.get(`
      SELECT p.* 
      FROM projects p
      JOIN teams t ON p.teamId = t.id
      JOIN team_members tm ON t.id = tm.teamId
      WHERE p.id = ? AND tm.userId = ?
    `, [id, req.user.id]);

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Delete project (cascade will handle related records)
    await db.run('DELETE FROM projects WHERE id = ?', [id]);

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Add feedback to a project
app.post('/api/faculty/projects/:projectId/feedback', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty can provide feedback' });
    }

    const result = await db.run(
      'INSERT INTO feedback (projectId, userId, content) VALUES (?, ?, ?)',
      [projectId, userId, comment]
    );

    res.json({ id: result.lastID, message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// Faculty: Rate a project
app.post('/api/faculty/projects/:projectId/rate', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating } = req.body;
    const facultyId = req.user.id;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty can rate projects' });
    }

    const result = await db.run(
      'INSERT OR REPLACE INTO project_ratings (projectId, facultyId, rating) VALUES (?, ?, ?)',
      [projectId, facultyId, rating]
    );

    res.json({ id: result.lastID, message: 'Rating added successfully' });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Student feedback route
app.get('/api/student/feedback', authenticateToken, async (req, res) => {
  try {
    // Verify user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    console.log('Fetching feedback for student:', req.user.id);

    // Get feedback for projects where the user is a team member
    const feedback = await db.all(`
      SELECT 
        f.id,
        f.content,
        f.rating,
        f.createdAt,
        u.username as facultyName,
        p.id as projectId,
        p.title as projectTitle,
        p.thumbnailUrl
      FROM feedback f
      JOIN users u ON f.userId = u.id
      JOIN projects p ON f.projectId = p.id
      JOIN team_members tm ON p.teamId = tm.teamId
      WHERE tm.userId = ? 
        AND f.isPrivate = 0 
        AND u.role = 'faculty'
      ORDER BY f.createdAt DESC
    `, [req.user.id]);

    console.log('Found feedback items:', feedback.length);

    // Transform the flat results into nested objects
    const transformedFeedback = feedback.map(item => ({
      id: item.id,
      content: item.content,
      rating: item.rating,
      createdAt: item.createdAt,
      facultyName: item.facultyName,
      project: {
        id: item.projectId,
        title: item.projectTitle,
        thumbnailUrl: item.thumbnailUrl
      }
    }));

    console.log('Transformed feedback:', transformedFeedback);
    res.json(transformedFeedback);
  } catch (err) {
    console.error('Error fetching student feedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Student: Get performance metrics
app.get('/api/student/performance', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get average ratings for student's projects
    const ratings = await db.all(`
      SELECT 
        p.id as projectId,
        p.title as projectTitle,
        AVG(pr.rating) as averageRating,
        COUNT(pr.rating) as totalRatings
      FROM projects p
      JOIN teams t ON p.teamId = t.id
      JOIN team_members tm ON t.id = tm.teamId
      LEFT JOIN project_ratings pr ON p.id = pr.projectId
      WHERE tm.userId = ? AND tm.role = 'leader'
      GROUP BY p.id
    `, [studentId]);

    // Get total projects
    const projectCount = await db.get(`
      SELECT COUNT(*) as count
      FROM projects p
      JOIN teams t ON p.teamId = t.id
      JOIN team_members tm ON t.id = tm.teamId
      WHERE tm.userId = ? AND tm.role = 'leader'
    `, [studentId]);

    // Get achievements
    const achievements = await db.all(`
      SELECT *
      FROM achievements
      WHERE studentId = ?
      ORDER BY createdAt DESC
    `, [studentId]);

    // Get leaderboard position
    const leaderboard = await db.all(`
      WITH StudentScores AS (
        SELECT 
          u.id,
          u.username,
          COUNT(DISTINCT p.id) as projectCount,
          AVG(pr.rating) as avgRating
        FROM users u
        JOIN team_members tm ON u.id = tm.userId
        JOIN teams t ON tm.teamId = t.id
        JOIN projects p ON t.id = p.teamId
        LEFT JOIN project_ratings pr ON p.id = pr.projectId
        WHERE u.role = 'student'
        GROUP BY u.id
        ORDER BY avgRating DESC, projectCount DESC
      )
      SELECT 
        id,
        username,
        projectCount,
        avgRating,
        (ROW_NUMBER() OVER (ORDER BY avgRating DESC, projectCount DESC)) as rank
      FROM StudentScores
    `);

    const userRank = leaderboard.find(student => student.id === studentId)?.rank || 0;

    res.json({
      ratings,
      projectCount: projectCount.count,
      achievements,
      leaderboard,
      rank: userRank
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Faculty feedback endpoint
app.post('/api/faculty/projects/:id/feedback', authenticateToken, async (req, res) => {
  const { id: projectId } = req.params;
  const { content, rating, isPrivate = false } = req.body;
  const userId = req.user.id;

  try {
    // Verify user is faculty
    if (req.user.role !== 'faculty') {
      console.log('Unauthorized attempt to submit feedback. User role:', req.user.role);
      return res.status(403).json({ error: 'Only faculty members can provide feedback' });
    }

    // Verify project exists
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Insert feedback
    const result = await db.run(
      `INSERT INTO feedback (content, rating, userId, projectId, isPrivate)
       VALUES (?, ?, ?, ?, ?)`,
      [content, rating, userId, projectId, isPrivate ? 1 : 0]
    );

    // Get the inserted feedback with user details
    const insertedFeedback = await db.get(`
      SELECT 
        f.*,
        u.username as facultyName,
        p.title as projectTitle
      FROM feedback f
      JOIN users u ON f.userId = u.id
      JOIN projects p ON f.projectId = p.id
      WHERE f.id = ?
    `, [result.lastID]);

    console.log('Feedback submitted successfully:', insertedFeedback);
    res.status(201).json(insertedFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get project feedback
app.get('/api/projects/:projectId/feedback', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    console.log('Fetching feedback for project:', projectId, 'by user:', req.user.id, 'role:', req.user.role);
    
    // Get feedback based on user role
    let feedback;
    if (req.user.role === 'faculty' || req.user.role === 'admin') {
      // Faculty and admin can see all feedback
      feedback = await db.all(`
        SELECT 
          f.*,
          u.username as facultyName,
          p.title as projectTitle
        FROM feedback f
        JOIN users u ON f.userId = u.id
        JOIN projects p ON f.projectId = p.id
        WHERE f.projectId = ?
        ORDER BY f.createdAt DESC
      `, [projectId]);
    } else {
      // Others can only see non-private feedback
      feedback = await db.all(`
        SELECT 
          f.*,
          u.username as facultyName,
          p.title as projectTitle
        FROM feedback f
        JOIN users u ON f.userId = u.id
        JOIN projects p ON f.projectId = p.id
        WHERE f.projectId = ? AND f.isPrivate = 0
        ORDER BY f.createdAt DESC
      `, [projectId]);
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Submit feedback endpoint
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { projectId, content, rating, isPrivate = false } = req.body;
    const userId = req.user.id;

    console.log('Feedback submission attempt:', {
      projectId,
      userId,
      content: content?.substring(0, 50) + '...',
      rating,
      isPrivate
    });

    // Verify that the user is a faculty member
    const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
    console.log('User role:', user?.role);

    if (!user || user.role !== 'faculty') {
      console.log('Unauthorized: User is not faculty');
      return res.status(403).json({ message: 'Only faculty members can submit feedback' });
    }

    // Verify project exists
    const project = await db.get('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await db.run(
      'INSERT INTO feedback (projectId, userId, content, rating, isPrivate) VALUES (?, ?, ?, ?, ?)',
      [projectId, userId, content, rating, isPrivate ? 1 : 0]
    );

    console.log('Feedback stored successfully:', {
      feedbackId: result.lastID,
      projectId,
      userId
    });

    // Get the created feedback with user details
    const createdFeedback = await db.get(`
      SELECT 
        f.*,
        u.username,
        u.firstName,
        u.lastName,
        u.role
      FROM feedback f
      JOIN users u ON f.userId = u.id
      WHERE f.id = ?
    `, [result.lastID]);

    res.status(201).json(createdFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});


// Get all feedback for a faculty member
app.get('/api/faculty/feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user is faculty
    const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
    if (!user || user.role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty members can access this endpoint' });
    }

    console.log('Fetching all feedback for faculty:', userId);

    // Get all feedback with project details
    const feedback = await db.all(`
      SELECT 
        f.*,
        p.title as projectTitle,
        p.thumbnailUrl as projectThumbnail,
        p.id as projectId
      FROM feedback f
      JOIN projects p ON f.projectId = p.id
      WHERE f.userId = ?
      ORDER BY f.createdAt DESC
    `, [userId]);

    console.log('Found feedback items:', feedback.length);

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching faculty feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Function to seed feedback data
const seedFeedbackData = async () => {
  try {
    // Check if there's any feedback
    const feedbackCount = await db.get('SELECT COUNT(*) as count FROM feedback');
    
    if (feedbackCount.count === 0) {
      console.log('Seeding feedback data...');
      
      // Get a faculty user (or create one if doesn't exist)
      let facultyUser = await db.get("SELECT * FROM users WHERE role = 'faculty' LIMIT 1");
      
      if (!facultyUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('faculty123', salt);
        
        const result = await db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          ['faculty1', 'faculty1@example.com', hashedPassword, 'faculty']
        );
        
        facultyUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      }
      
      // Get student projects
      const projects = await db.all(`
        SELECT p.* 
        FROM projects p
        JOIN teams t ON p.teamId = t.id
        JOIN team_members tm ON t.id = tm.teamId
        JOIN users u ON tm.userId = u.id
        WHERE u.role = 'student'
      `);
      
      // Add feedback for each project
      for (const project of projects) {
        await db.run(
          'INSERT INTO feedback (content, rating, userId, projectId, isPrivate) VALUES (?, ?, ?, ?, ?)',
          [
            'Great work on this project! The implementation is solid and shows good understanding.',
            4,
            facultyUser.id,
            project.id,
            0
          ]
        );
        
        await db.run(
          'INSERT INTO feedback (content, rating, userId, projectId, isPrivate) VALUES (?, ?, ?, ?, ?)',
          [
            'There is room for improvement in code organization, but overall good effort.',
            3,
            facultyUser.id,
            project.id,
            0
          ]
        );
      }
      
      console.log('Feedback data seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding feedback data:', err);
  }
};

// Function to update existing projects with better images
const updateProjectImages = async () => {
  try {
    console.log('Updating project images...');
    
    const imageUpdates = [
      { id: 1, thumbnailUrl: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=1200&auto=format&fit=crop&q=80' },
      { id: 2, thumbnailUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&auto=format&fit=crop&q=80' },
      { id: 3, thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&auto=format&fit=crop&q=80' },
      { id: 4, thumbnailUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&auto=format&fit=crop&q=80' },
      { id: 5, thumbnailUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&auto=format&fit=crop&q=80' },
      { id: 6, thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop&q=80' },
      { id: 7, thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80' },
      { id: 8, thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&auto=format&fit=crop&q=80' }
    ];
    
    for (const update of imageUpdates) {
      await db.run('UPDATE projects SET thumbnailUrl = ? WHERE id = ?', [update.thumbnailUrl, update.id]);
    }
    
    console.log('Project images updated successfully');
  } catch (err) {
    console.error('Error updating project images:', err);
  }
};

// Function to seed sample projects
const seedSampleProjects = async () => {
  try {
    // Clear existing projects and reseed with new ones
    console.log('Clearing existing projects and reseeding...');
    await db.run('DELETE FROM project_sdgs');
    await db.run('DELETE FROM project_media');
    await db.run('DELETE FROM projects');
    await db.run('DELETE FROM team_members');
    await db.run('DELETE FROM teams');
      console.log('Seeding sample projects...');
      
      // Create multiple sample teams
      const teams = [
        { name: 'EcoTech Solutions', description: 'A team focused on sustainable technology development' },
        { name: 'Green Innovation Hub', description: 'Developing innovative solutions for environmental challenges' },
        { name: 'Sustainable Future Lab', description: 'Research and development for sustainable technologies' },
        { name: 'Climate Action Team', description: 'Committed to climate change mitigation and adaptation' },
        { name: 'Renewable Energy Group', description: 'Specializing in clean energy solutions' },
        { name: 'Environmental Tech Crew', description: 'Building technology for environmental protection' },
        { name: 'Green Building Alliance', description: 'Sustainable architecture and construction solutions' },
        { name: 'Ocean Conservation Squad', description: 'Marine life protection and ocean cleanup technologies' },
        { name: 'Smart City Developers', description: 'Creating intelligent and sustainable urban solutions' },
        { name: 'Biodiversity Guardians', description: 'Protecting and preserving natural ecosystems' }
      ];
      
      const teamIds = [];
      for (const team of teams) {
        const teamResult = await db.run(
          'INSERT INTO teams (name, description) VALUES (?, ?)',
          [team.name, team.description]
        );
        teamIds.push(teamResult.lastID);
      }
      
      // Create sample users and add them to teams
      const sampleUsers = [
        { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User' },
        { username: 'faculty1', email: 'faculty1@example.com', password: 'faculty123', role: 'faculty', firstName: 'Dr. Sarah', lastName: 'Johnson' },
        { username: 'faculty2', email: 'faculty2@example.com', password: 'faculty123', role: 'faculty', firstName: 'Prof. Michael', lastName: 'Chen' },
        { username: 'student1', email: 'student1@example.com', password: 'student123', role: 'student', firstName: 'Alex', lastName: 'Smith' },
        { username: 'student2', email: 'student2@example.com', password: 'student123', role: 'student', firstName: 'Emma', lastName: 'Wilson' },
        { username: 'student3', email: 'student3@example.com', password: 'student123', role: 'student', firstName: 'James', lastName: 'Brown' },
        { username: 'student4', email: 'student4@example.com', password: 'student123', role: 'student', firstName: 'Sophia', lastName: 'Davis' },
        { username: 'student5', email: 'student5@example.com', password: 'student123', role: 'student', firstName: 'David', lastName: 'Miller' }
      ];
      
      const userIds = [];
      for (const user of sampleUsers) {
        // Check if user already exists
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [user.username]);
        if (existingUser) {
          userIds.push(existingUser.id);
          continue;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        const userResult = await db.run(
          'INSERT INTO users (username, email, password, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.role, user.firstName, user.lastName]
        );
        userIds.push(userResult.lastID);
      }
      
      // Add users to teams as team members
      for (let i = 0; i < teamIds.length; i++) {
        const teamId = teamIds[i];
        const userId = userIds[i % userIds.length]; // Distribute users across teams
        
        // Check if team member already exists
        const existingMember = await db.get(
          'SELECT id FROM team_members WHERE teamId = ? AND userId = ?',
          [teamId, userId]
        );
        
        if (!existingMember) {
          await db.run(
            'INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)',
            [teamId, userId, 'member']
          );
        }
      }
      
      // Sample projects with high-quality images
      const projects = [
        {
          title: 'Smart Water Management System',
          description: 'An IoT-based system for monitoring and optimizing water usage in urban areas with real-time analytics and automated controls.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/smart-water',
          demoUrl: 'https://demo.smart-water.example.com',
          sdgs: [6, 11, 13] // Clean Water, Sustainable Cities, Climate Action
        },
        {
          title: 'Renewable Energy Dashboard',
          description: 'Real-time monitoring and analytics platform for renewable energy systems with predictive maintenance capabilities.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/energy-dashboard',
          demoUrl: 'https://demo.energy-dashboard.example.com',
          sdgs: [7, 13] // Clean Energy, Climate Action
        },
        {
          title: 'Sustainable Agriculture App',
          description: 'Mobile application for farmers to implement sustainable farming practices with AI-powered crop recommendations.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/sustainable-agri',
          demoUrl: 'https://demo.sustainable-agri.example.com',
          sdgs: [2, 15] // Zero Hunger, Life on Land
        },
        {
          title: 'Urban Waste Management',
          description: 'Smart waste collection and recycling system for urban areas with route optimization and citizen engagement.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/urban-waste',
          demoUrl: 'https://demo.urban-waste.example.com',
          sdgs: [11, 12] // Sustainable Cities, Responsible Consumption
        },
        {
          title: 'Education Platform',
          description: 'Online learning platform focused on sustainable development education with interactive modules and assessments.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/edu-platform',
          demoUrl: 'https://demo.edu-platform.example.com',
          sdgs: [4, 17] // Quality Education, Partnerships
        },
        {
          title: 'Ocean Cleanup Technology',
          description: 'Advanced marine debris collection system using autonomous drones and AI-powered detection.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/ocean-cleanup',
          demoUrl: 'https://demo.ocean-cleanup.example.com',
          sdgs: [14, 15] // Life Below Water, Life on Land
        },
        {
          title: 'Green Building Analytics',
          description: 'Smart building management system for optimizing energy efficiency and reducing carbon footprint.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/green-building',
          demoUrl: 'https://demo.green-building.example.com',
          sdgs: [7, 11, 13] // Clean Energy, Sustainable Cities, Climate Action
        },
        {
          title: 'Digital Health Monitoring',
          description: 'Remote health monitoring system for underserved communities with telemedicine integration.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/digital-health',
          demoUrl: 'https://demo.digital-health.example.com',
          sdgs: [3, 10] // Good Health, Reduced Inequalities
        },
        {
          title: 'Climate Data Visualization',
          description: 'Interactive platform for visualizing climate change data and environmental impact metrics.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/climate-viz',
          demoUrl: 'https://demo.climate-viz.example.com',
          sdgs: [13, 15] // Climate Action, Life on Land
        },
        {
          title: 'Sustainable Transportation Network',
          description: 'Smart transportation system promoting eco-friendly commuting with real-time route optimization.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/sustainable-transport',
          demoUrl: 'https://demo.sustainable-transport.example.com',
          sdgs: [11, 13] // Sustainable Cities, Climate Action
        },
        {
          title: 'Biodiversity Conservation App',
          description: 'Mobile application for tracking and conserving local biodiversity with citizen science integration.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/biodiversity-app',
          demoUrl: 'https://demo.biodiversity-app.example.com',
          sdgs: [15, 17] // Life on Land, Partnerships
        },
        {
          title: 'Circular Economy Marketplace',
          description: 'Digital platform connecting businesses for waste-to-resource exchanges and circular economy practices.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/circular-economy',
          demoUrl: 'https://demo.circular-economy.example.com',
          sdgs: [12, 17] // Responsible Consumption, Partnerships
        },
        {
          title: 'Clean Air Quality Monitor',
          description: 'IoT-based air quality monitoring system with public health alerts and pollution source tracking.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/air-quality',
          demoUrl: 'https://demo.air-quality.example.com',
          sdgs: [3, 11, 13] // Good Health, Sustainable Cities, Climate Action
        },
        {
          title: 'Sustainable Food Distribution',
          description: 'Platform connecting local food producers with consumers to reduce food waste and promote sustainable eating.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/food-distribution',
          demoUrl: 'https://demo.food-distribution.example.com',
          sdgs: [2, 12] // Zero Hunger, Responsible Consumption
        },
        {
          title: 'Green Technology Innovation Hub',
          description: 'Collaborative platform for sharing and developing sustainable technology solutions.',
          thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
          repositoryUrl: 'https://github.com/example/green-tech-hub',
          demoUrl: 'https://demo.green-tech-hub.example.com',
          sdgs: [9, 17] // Industry Innovation, Partnerships
        }
      ];
      
      // Insert projects
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const teamId = teamIds[i % teamIds.length]; // Distribute projects across teams
        
        const result = await db.run(
          `INSERT INTO projects 
            (title, description, thumbnailUrl, repositoryUrl, demoUrl, teamId) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [project.title, project.description, project.thumbnailUrl, project.repositoryUrl, project.demoUrl, teamId]
        );
        
        const projectId = result.lastID;
        
        // Add SDGs
        for (const sdgNumber of project.sdgs) {
          await db.run(
            'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)',
            [projectId, sdgNumber]
          );
        }
        
        // Add additional media URLs for each project
        const additionalMediaUrls = [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
        ];
        
        for (const mediaUrl of additionalMediaUrls) {
          await db.run(
            'INSERT INTO project_media (projectId, mediaUrl, mediaType) VALUES (?, ?, ?)',
            [projectId, mediaUrl, 'image']
          );
        }
      }
      
      console.log('Sample projects seeded successfully');
  } catch (err) {
    console.error('Error seeding sample projects:', err);
  }
};
// Image upload endpoint
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image' 
    });
  }
});

// Start server
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
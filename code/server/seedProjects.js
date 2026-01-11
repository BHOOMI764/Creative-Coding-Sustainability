import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sampleProjects = [
  
  
  {
    title: "Solar-Powered Education Pods",
    description: "Mobile solar-powered learning centers with integrated computers and internet connectivity for rural areas.",
    thumbnailUrl: "https://example.com/images/solar-education.jpg",
    sdgs: [4, 7, 10], // Quality Education, Clean Energy, Reduced Inequalities
    teamName: "EduTech Innovators"
  },
  {
    title: "AI-Driven Crop Management",
    description: "Machine learning system for optimizing crop yields and reducing resource usage in agriculture.",
    thumbnailUrl: "https://example.com/images/ai-agriculture.jpg",
    sdgs: [2, 12, 13], // Zero Hunger, Responsible Consumption, Climate Action
    teamName: "AgriTech AI"
  },
  {
    title: "Blockchain for Fair Trade",
    description: "Blockchain platform ensuring transparent and fair trade practices in global supply chains.",
    thumbnailUrl: "https://example.com/images/blockchain-trade.jpg",
    sdgs: [1, 8, 10], // No Poverty, Good Jobs, Reduced Inequalities
    teamName: "FairChain"
  },
  {
    title: "Smart Healthcare Monitor",
    description: "Wearable device for remote health monitoring and early disease detection in underserved areas.",
    thumbnailUrl: "https://example.com/images/health-monitor.jpg",
    sdgs: [3, 10], // Good Health, Reduced Inequalities
    teamName: "HealthTech Pioneers"
  },
  {
    title: "Waste-to-Energy Converter",
    description: "System converting organic waste into renewable energy for local communities.",
    thumbnailUrl: "https://example.com/images/waste-energy.jpg",
    sdgs: [7, 11, 12], // Clean Energy, Sustainable Cities, Responsible Consumption
    teamName: "GreenEnergy Solutions"
  },
  {
    title: "Digital Gender Equality Platform",
    description: "Online platform providing tech education and job opportunities specifically for women in technology.",
    thumbnailUrl: "https://example.com/images/gender-tech.jpg",
    sdgs: [5, 4, 8], // Gender Equality, Quality Education, Good Jobs
    teamName: "TechEquality"
  },
  {
    title: "Marine Life Monitoring System",
    description: "Underwater drone network for monitoring marine ecosystems and pollution levels.",
    thumbnailUrl: "https://example.com/images/marine-monitor.jpg",
    sdgs: [14, 13], // Life Below Water, Climate Action
    teamName: "OceanTech"
  },
  {
    title: "Forest Conservation AI",
    description: "AI-powered system for monitoring deforestation and wildlife preservation using satellite imagery.",
    thumbnailUrl: "https://example.com/images/forest-ai.jpg",
    sdgs: [15, 13], // Life on Land, Climate Action
    teamName: "ForestGuard AI"
  },
  {
    title: "Smart City Management Platform",
    description: "Integrated platform for managing city resources, traffic, and public services efficiently.",
    thumbnailUrl: "https://example.com/images/smart-city.jpg",
    sdgs: [11, 9], // Sustainable Cities, Innovation
    teamName: "CityTech Solutions"
  },
  {
    title: "Renewable Energy Grid Optimizer",
    description: "AI system for optimizing renewable energy distribution and storage in power grids.",
    thumbnailUrl: "https://example.com/images/grid-optimizer.jpg",
    sdgs: [7, 9, 13], // Clean Energy, Innovation, Climate Action
    teamName: "GridTech"
  },
  {
    title: "Digital Education for All",
    description: "Mobile learning platform with offline capabilities for universal education access.",
    thumbnailUrl: "https://example.com/images/digital-edu.jpg",
    sdgs: [4, 10], // Quality Education, Reduced Inequalities
    teamName: "EduAccess"
  },
  {
    title: "Sustainable Supply Chain Platform",
    description: "Digital platform for tracking and optimizing sustainability in supply chains.",
    thumbnailUrl: "https://example.com/images/supply-chain.jpg",
    sdgs: [12, 9, 13], // Responsible Consumption, Innovation, Climate Action
    teamName: "GreenChain"
  },
  {
    title: "Community Health Predictor",
    description: "AI system for predicting and preventing health issues in communities.",
    thumbnailUrl: "https://example.com/images/health-predict.jpg",
    sdgs: [3, 10], // Good Health, Reduced Inequalities
    teamName: "HealthPredict"
  },
  {
    title: "Clean Water Tech",
    description: "Advanced water purification system using nanotechnology for developing regions.",
    thumbnailUrl: "https://example.com/images/water-tech.jpg",
    sdgs: [6, 3], // Clean Water, Good Health
    teamName: "PureWater Tech"
  },
  {
    title: "Digital Peace Platform",
    description: "Online platform for conflict resolution and peace-building using AI mediation.",
    thumbnailUrl: "https://example.com/images/peace-tech.jpg",
    sdgs: [16, 17], // Peace & Justice, Partnerships
    teamName: "PeaceTech"
  },
  {
    title: "Poverty Analysis System",
    description: "AI-driven system for analyzing poverty patterns and optimizing aid distribution.",
    thumbnailUrl: "https://example.com/images/poverty-tech.jpg",
    sdgs: [1, 10], // No Poverty, Reduced Inequalities
    teamName: "AidTech"
  },
  {
    title: "Green Building Optimizer",
    description: "IoT system for optimizing energy usage and sustainability in buildings.",
    thumbnailUrl: "https://example.com/images/green-building.jpg",
    sdgs: [11, 7, 13], // Sustainable Cities, Clean Energy, Climate Action
    teamName: "GreenBuild Tech"
  },
  {
    title: "Food Security Platform",
    description: "Platform connecting food producers with communities to reduce waste and improve distribution.",
    thumbnailUrl: "https://example.com/images/food-security.jpg",
    sdgs: [2, 12], // Zero Hunger, Responsible Consumption
    teamName: "FoodTech Connect"
  },
  {
    title: "Global Education Network",
    description: "Blockchain-based platform for verifying and sharing educational credentials globally.",
    thumbnailUrl: "https://example.com/images/edu-network.jpg",
    sdgs: [4, 17], // Quality Education, Partnerships
    teamName: "EduChain"
  }
];

async function seedProjects() {
  try {
    const db = await open({
      filename: join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Create a test student user if not exists
    const testStudent = await db.get('SELECT * FROM users WHERE email = ?', ['student@test.com']);
    let studentId;
    
    if (!testStudent) {
      const result = await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['teststudent', 'student@test.com', 'hashedpassword', 'student']
      );
      studentId = result.lastID;
    } else {
      studentId = testStudent.id;
    }

    console.log('Starting to seed projects...');

    for (const project of sampleProjects) {
      await db.run('BEGIN TRANSACTION');

      try {
        // Create team
        const teamResult = await db.run(
          'INSERT INTO teams (name, description) VALUES (?, ?)',
          [project.teamName, 'Team working on ' + project.title]
        );
        const teamId = teamResult.lastID;

        // Add team member (test student)
        await db.run(
          'INSERT INTO team_members (teamId, userId, role) VALUES (?, ?, ?)',
          [teamId, studentId, 'leader']
        );

        // Create project
        const projectResult = await db.run(
          'INSERT INTO projects (title, description, thumbnailUrl, teamId) VALUES (?, ?, ?, ?)',
          [project.title, project.description, project.thumbnailUrl, teamId]
        );
        const projectId = projectResult.lastID;

        // Add SDGs
        for (const sdgNumber of project.sdgs) {
          const sdg = await db.get('SELECT id FROM sdgs WHERE number = ?', [sdgNumber]);
          if (sdg) {
            await db.run(
              'INSERT INTO project_sdgs (projectId, sdgId) VALUES (?, ?)',
              [projectId, sdg.id]
            );
          }
        }

        await db.run('COMMIT');
        console.log(`Created project: ${project.title}`);
      } catch (err) {
        await db.run('ROLLBACK');
        console.error(`Error creating project ${project.title}:`, err);
      }
    }

    console.log('Finished seeding projects');
    process.exit(0);
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
}

seedProjects(); 
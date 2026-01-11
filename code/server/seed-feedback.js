// import { open } from 'sqlite';
// import sqlite3 from 'sqlite3';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function seedFeedback() {
//   try {
//     const db = await open({
//       filename: path.join(__dirname, 'database.sqlite'),
//       driver: sqlite3.Database
//     });

//     // Get a faculty user (or create one if doesn't exist)
//     let faculty = await db.get("SELECT * FROM users WHERE role = 'faculty' LIMIT 1");
//     if (!faculty) {
//       const result = await db.run(
//         "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'faculty')",
//         ['faculty1', 'faculty1@example.com', 'hashedpassword']
//       );
//       faculty = { id: result.lastID };
//     }

//     // Get student projects
//     const projects = await db.all(`
//       SELECT DISTINCT p.id
//       FROM projects p
//       JOIN teams t ON p.teamId = t.id
//       JOIN team_members tm ON t.id = tm.teamId
//       JOIN users u ON tm.userId = u.id
//       WHERE u.role = 'student'
//     `);

//     if (projects.length > 0) {
//       // Add feedback for each project
//       for (const project of projects) {
//         await db.run(
//           'INSERT INTO feedback (content, rating, userId, projectId, isPrivate) VALUES (?, ?, ?, ?, ?)',
//           [
//             'Great work on this project! The implementation is clean and well-documented.',
//             5,
//             faculty.id,
//             project.id,
//             0
//           ]
//         );
//       }
//       console.log('Feedback data seeded successfully');
//     } else {
//       console.log('No student projects found to add feedback to');
//     }

//     await db.close();
//   } catch (error) {
//     console.error('Error seeding feedback:', error);
//   }
// }

// seedFeedback(); 
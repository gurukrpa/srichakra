import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAdminRoutes } from "./admin-routes-supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for executing code - could be expanded later for saving/loading code snippets
  app.post('/api/execute', (req, res) => {
    try {
      const { code } = req.body;
      // We don't actually execute the code on the server - this is just a placeholder
      // for future functionality like saving code snippets
      res.status(200).json({ 
        success: true, 
        message: 'Code execution happens client-side for security reasons'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });

  // User registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
  const { name, email, password, studentName, parentName, schoolName, age, occupation, city, country, notes, phone, studentClass } = req.body;
      
      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.username, email)
      });
      
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
      
      // Combine phone into notes if schema has no phone column
  const combinedNotes = [notes, phone ? `Phone: ${phone}` : null, studentClass ? `Class: ${studentClass}` : null].filter(Boolean).join(' | ');
      
      // Insert new user with full profile data
      const newUser = await db.insert(schema.users).values({
        username: email,
        password: password, // Note: In production, hash passwords
        fullName: name,
        studentName: studentName ?? null,
        parentName: parentName ?? null,
        schoolName: schoolName ?? null,
        age: age != null ? String(age) : null,
        occupation: occupation ?? null,
        city: city ?? null,
        country: country ?? null,
        notes: combinedNotes || null,
      }).returning();
      
      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: newUser[0].id, username: newUser[0].username }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: error?.message || 'Server error during registration' 
      });
    }
  });

  // User login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email or password' });
      }
      
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(schema.users.username, email)
      });
      
      if (!user || user.password !== password) { // In production, use proper password comparison
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during login' 
      });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);
  
  // Admin dashboard routes temporarily disabled to avoid ORM-related crashes.

  const httpServer = createServer(app);

  return httpServer;
}

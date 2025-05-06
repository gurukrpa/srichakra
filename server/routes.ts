import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}

// server/serverless-handler.ts
import { Request, Response } from 'express';

/**
 * Creates a handler function for serverless environments like Vercel
 * @param handler The Express-style handler function to wrap
 */
export function createServerlessHandler(handler: (req: Request, res: Response) => Promise<void>) {
  return async (req: any, res: any) => {
    try {
      // Add CORS headers for API routes
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,OPTIONS,PATCH,DELETE,POST,PUT'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );

      // Handle OPTIONS requests for CORS preflight
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Call the handler with the request and response
      await handler(req, res);
    } catch (error) {
      console.error('Serverless handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Proxy requests to Python ML backend
  const PYTHON_BACKEND_URL = 'http://localhost:5000';

  // Validation endpoint
  app.post('/api/validate', async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('Python ML backend unavailable, client will use fallback');
      res.status(500).json({
        success: false,
        error: 'ML validation service unavailable'
      });
    }
  });

  // Pitch generation endpoint
  app.post('/api/generate-pitch', async (req, res) => {
    try {
      // Check if we can reach the Python backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`${PYTHON_BACKEND_URL}/api/generate-pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('Python ML backend unavailable for pitch generation, client will use fallback');
      res.status(500).json({
        success: false,
        error: 'Pitch generation service unavailable'
      });
    }
  });

  // SWOT analysis endpoint
  app.post('/api/generate-swot', async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/generate-swot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('Python ML backend unavailable for SWOT analysis, client will use fallback');
      res.status(500).json({
        success: false,
        error: 'SWOT analysis service unavailable'
      });
    }
  });

  // Founder readiness endpoint
  app.post('/api/founder-readiness', async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/founder-readiness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('Python ML backend unavailable for founder readiness, client will use fallback');
      res.status(500).json({
        success: false,
        error: 'Founder readiness service unavailable'
      });
    }
  });

  // Market research endpoint
  app.post('/api/market-research', async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/market-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('Python ML backend unavailable for market research, client will use fallback');
      res.status(500).json({
        success: false,
        error: 'Market research service unavailable'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      res.json({
        ...data,
        proxy_status: 'healthy'
      });
    } catch (error) {
      res.json({
        status: 'degraded',
        proxy_status: 'healthy',
        ml_validator: 'unavailable',
        message: 'Python ML backend is not running - using fallback functionality',
        timestamp: new Date().toISOString()
      });
    }
  });

  return app;
}

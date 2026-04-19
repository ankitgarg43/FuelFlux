import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

// Initialize Gemini - allow it to fail silently if no key is present for publishing
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn("No Gemini API Key provided. AI features will be disabled.");
}

// In-memory database for social features
interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface SocialData {
  ratings: number[];
  comments: Comment[];
}

const db: Record<string, SocialData> = {};

function getSocialData(id: string): SocialData {
  if (!db[id]) {
    db[id] = { ratings: [], comments: [] };
  }
  return db[id];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // 1. Scrape/Aggregate Data (Using Reddit JSON API as a reliable source)
  app.get('/api/feed', async (req, res) => {
    try {
      const subreddit = (req.query.topic as string) || 'technology';
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`);
      const data = await response.json();
      
      if (!data.data || !data.data.children) {
        return res.status(500).json({ error: 'Failed to fetch data' });
      }

      const items = data.data.children.map((child: any) => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          url: post.url,
          source: `r/${post.subreddit}`,
          author: post.author,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          thumbnail: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null,
          text: post.selftext || '',
        };
      });

      res.json({ items });
    } catch (error) {
      console.error('Feed error:', error);
      res.status(500).json({ error: 'Failed to aggregate data' });
    }
  });

  // 2. Social Features
  app.get('/api/social/:id', (req, res) => {
    const data = getSocialData(req.params.id);
    const averageRating = data.ratings.length > 0 
      ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
      : 0;
    
    res.json({
      averageRating,
      totalRatings: data.ratings.length,
      comments: data.comments
    });
  });

  app.post('/api/social/:id/rate', (req, res) => {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }
    
    const data = getSocialData(req.params.id);
    data.ratings.push(rating);
    res.json({ success: true });
  });

  app.post('/api/social/:id/comment', (req, res) => {
    const { text, author } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid comment' });
    }

    const data = getSocialData(req.params.id);
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      text,
      author: author || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    
    data.comments.push(newComment);
    res.json(newComment);
  });

  // 3. Intelligent Analysis (Gemini)
  app.post('/api/analyze', async (req, res) => {
    try {
      if (!ai) {
        return res.json({ analysis: "AI Analysis is currently disabled. Please provide an API key." });
      }

      const { title, text } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required for analysis' });
      }

      const prompt = `Analyze the following content and provide a brief, insightful summary (max 3 sentences) focusing on its significance, potential impact, or key takeaways for a reader. 
      
      Title: ${title}
      Content: ${text || 'No additional content provided.'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze content' });
    }
  });

  // --- Vite Middleware (Development) or Static Serving (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

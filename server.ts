import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is missing. AI Voice narration will use the browser speech fallback or display an alert.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for pirate narration
  app.post('/api/narrate', async (req, res) => {
    try {
      const { text, voiceName = 'Charon' } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required for narration" });
      }

      if (!ai) {
        return res.status(503).json({ 
          error: "Le client de l'API Gemini n'est pas initialisé. Veuillez configurer votre clé API dans les secrets." 
        });
      }

      // Instructing the model to act as a theatrical pirate in French
      const prompt = `Joue le rôle d'un pirate ou d'un vieux loup de mer. Lis le passage suivant avec une intonation théâtrale, immersive, pleine d'aventure et de mystère en français : "${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(502).json({ error: "L'IA n'a pas retourné de piste audio." });
      }

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("Narration API Error:", error);
      res.status(500).json({ error: error.message || "Erreur lors de la génération de la voix off." });
    }
  });

  // Serve static assets and frontend
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Pirate Story server sailing on http://0.0.0.0:${port}`);
  });
}

startServer();

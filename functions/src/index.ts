import * as dotenv from "dotenv";
dotenv.config();

import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Simple root route for testing
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running!");
});

// Gemini AI endpoint
app.post("/gemini", async (req: Request, res: Response): Promise<void> => {
  try {
    const { promptMessages } = req.body;
    if (!promptMessages) {
      res.status(400).json({ error: "Missing promptMessages" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: promptMessages,
    });

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.status(200).json({ text: aiText });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({
      error: "Failed to get Gemini response",
      details: error.response?.data || error.message,
    });
  }
});

// Export as Firebase Function
export const api = functions.https.onRequest(app);

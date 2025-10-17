require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemini chat
app.post('/api/gemini', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; // or GOOGLE_GEMINI_API_KEY
    const { promptMessages } = req.body; // Should be array with correct format

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: promptMessages
    });

    // Extract the generated reply text
    const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text: aiText });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: 'Failed to get Gemini response', details: err?.response?.data });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

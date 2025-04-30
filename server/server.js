import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/search", async (req, res) => {
  const { query } = req.body;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query || !apiKey) {
    return res.status(400).json({ error: "Missing query or API key" });
  }

  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&key=${apiKey}&type=video&maxResults=1`
    );
    const searchData = await searchResponse.json();

    const videoId = searchData.items?.[0]?.id?.videoId;
    console.log("🔎 Video ID encontrado:", videoId);

    if (!videoId) {
      return res.status(404).json({ error: "No video found" });
    }

    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    
    const videoDetails = await videoDetailsResponse.json();

    const title = videoDetails.items?.[0]?.snippet?.title;

    res.json({
      videoId,
      title: title || null,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

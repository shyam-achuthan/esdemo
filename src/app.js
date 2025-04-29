const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  checkConnection,
  basicSearch,
  fuzzySearch,
  languageSearch,
} = require("./elastic");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const isConnected = await checkConnection();
    if (isConnected) {
      return res
        .status(200)
        .json({ status: "ok", message: "Elasticsearch is connected" });
    } else {
      return res
        .status(500)
        .json({ status: "error", message: "Elasticsearch is not connected" });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Basic search endpoint
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ status: "error", message: "Query parameter is required" });
    }

    const results = await basicSearch(q);
    return res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Fuzzy search endpoint - handles spelling mistakes
app.get("/api/fuzzy-search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ status: "error", message: "Query parameter is required" });
    }

    const results = await fuzzySearch(q);
    return res.json({ results });
  } catch (error) {
    console.error("Fuzzy search error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Language-specific search endpoint
app.get("/api/language-search", async (req, res) => {
  try {
    const { q, lang } = req.query;

    if (!q || !lang) {
      return res.status(400).json({
        status: "error",
        message: "Both query (q) and language (lang) parameters are required",
      });
    }

    const results = await languageSearch(q, lang);
    return res.json({ results });
  } catch (error) {
    console.error("Language search error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- Health check:          http://localhost:${PORT}/health`);
  console.log(
    `- Basic search:          http://localhost:${PORT}/api/search?q=elasticsearch`
  );
  console.log(
    `- Fuzzy search:          http://localhost:${PORT}/api/fuzzy-search?q=elastcsearch`
  );
  console.log(
    `- Language search:       http://localhost:${PORT}/api/language-search?q=elasticsearch&lang=fr`
  );
});

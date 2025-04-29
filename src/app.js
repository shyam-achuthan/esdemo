const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { 
  checkConnection, 
  basicSearch,
  fuzzySearch,
  languageSearch,
  brandSearch,
  prefixSearch,
  multilingualSearch,
  spellingCorrectionSearch
} = require('./elastic');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isConnected = await checkConnection();
    if (isConnected) {
      return res.status(200).json({ status: 'ok', message: 'Elasticsearch is connected' });
    } else {
      return res.status(500).json({ status: 'error', message: 'Elasticsearch is not connected' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Basic search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ status: 'error', message: 'Query parameter is required' });
    }
    
    const results = await basicSearch(q);
    return res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Fuzzy search endpoint - handles spelling mistakes
app.get('/api/fuzzy-search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ status: 'error', message: 'Query parameter is required' });
    }
    
    const results = await fuzzySearch(q);
    return res.json({ results });
  } catch (error) {
    console.error('Fuzzy search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Language-specific search endpoint
app.get('/api/language-search', async (req, res) => {
  try {
    const { q, lang } = req.query;
    
    if (!q || !lang) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Both query (q) and language (lang) parameters are required' 
      });
    }
    
    const results = await languageSearch(q, lang);
    return res.json({ results });
  } catch (error) {
    console.error('Language search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Brand search endpoint
app.get('/api/brand-search', async (req, res) => {
  try {
    const { q, brand } = req.query;
    
    if (!q || !brand) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Both query (q) and brand parameters are required' 
      });
    }
    
    const results = await brandSearch(q, brand);
    return res.json({ results });
  } catch (error) {
    console.error('Brand search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Prefix search endpoint (autocomplete)
app.get('/api/prefix-search', async (req, res) => {
  try {
    const { prefix } = req.query;
    
    if (!prefix) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Prefix parameter is required' 
      });
    }
    
    const results = await prefixSearch(prefix);
    return res.json({ results });
  } catch (error) {
    console.error('Prefix search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Multilingual search endpoint
app.get('/api/multilingual-search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Query parameter is required' 
      });
    }
    
    const results = await multilingualSearch(q);
    return res.json({ results });
  } catch (error) {
    console.error('Multilingual search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Spelling correction search endpoint
app.get('/api/spelling-correction', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Query parameter is required' 
      });
    }
    
    const response = await spellingCorrectionSearch(q);
    return res.json(response);
  } catch (error) {
    console.error('Spelling correction search error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// API documentation
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Elasticsearch Demo API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #1a73e8; }
          h2 { color: #5f6368; margin-top: 20px; }
          code { background: #f1f3f4; padding: 2px 5px; border-radius: 4px; }
          pre { background: #f1f3f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
          .endpoint { margin-bottom: 20px; border-left: 3px solid #1a73e8; padding-left: 10px; }
        </style>
      </head>
      <body>
        <h1>Elasticsearch Search Capabilities Demo</h1>
        <p>This API demonstrates various search capabilities of Elasticsearch including product catalog search.</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <h3>Health Check</h3>
          <code>GET /health</code>
          <p>Check if Elasticsearch is connected.</p>
        </div>
        
        <div class="endpoint">
          <h3>Basic Search</h3>
          <code>GET /api/search?q=organic</code>
          <p>Performs a standard search across the title, content, description and keywords fields.</p>
        </div>
        
        <div class="endpoint">
          <h3>Fuzzy Search (for misspellings)</h3>
          <code>GET /api/fuzzy-search?q=organik</code>
          <p>Performs a fuzzy search that can handle spelling mistakes.</p>
          <p>Example: Try misspelling words like "organic" as "organik" or "tomato" as "tomatoe".</p>
        </div>
        
        <div class="endpoint">
          <h3>Language-specific Search</h3>
          <code>GET /api/language-search?q=organic&lang=en</code>
          <code>GET /api/language-search?q=ಆರ್ಗಾನಿಕ್&lang=kn</code>
          <p>Performs a search filtered by language.</p>
          <p>Available languages: "en", "kn"</p>
        </div>

        <div class="endpoint">
          <h3>Brand Search</h3>
          <code>GET /api/brand-search?q=organic&brand=Pro%20Nature</code>
          <p>Performs a search filtered by brand.</p>
        </div>
        
        <div class="endpoint">
          <h3>Prefix Search (Autocomplete)</h3>
          <code>GET /api/prefix-search?prefix=org</code>
          <p>Performs a prefix search to implement autocomplete functionality.</p>
        </div>
        
        <div class="endpoint">
          <h3>Multilingual Search</h3>
          <code>GET /api/multilingual-search?q=organic</code>
          <code>GET /api/multilingual-search?q=ಆರ್ಗಾನಿಕ್</code>
          <p>Searches across all languages (English and Kannada) for matching products.</p>
        </div>
        
        <div class="endpoint">
          <h3>Spelling Correction Search</h3>
          <code>GET /api/spelling-correction?q=organik</code>
          <p>Performs a search with spelling correction suggestions.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- Health check:          http://localhost:${PORT}/health`);
  console.log(`- Basic search:          http://localhost:${PORT}/api/search?q=organic`);
  console.log(`- Fuzzy search:          http://localhost:${PORT}/api/fuzzy-search?q=organik`);
  console.log(`- Language search:       http://localhost:${PORT}/api/language-search?q=organic&lang=en`);
  console.log(`- Brand search:          http://localhost:${PORT}/api/brand-search?q=organic&brand=Pro%20Nature`);
  console.log(`- Prefix search:         http://localhost:${PORT}/api/prefix-search?prefix=org`);
  console.log(`- Multilingual search:   http://localhost:${PORT}/api/multilingual-search?q=organic`);
  console.log(`- Spelling correction:   http://localhost:${PORT}/api/spelling-correction?q=organik`);
  console.log(`- API documentation:     http://localhost:${PORT}/`);
});

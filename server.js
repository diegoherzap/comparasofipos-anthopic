const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get all SOFIPO data
app.get('/api/sofipos', (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, 'data', 'sofipos.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    res.json(records);
  } catch (error) {
    console.error('Error reading SOFIPO data:', error);
    res.status(500).json({ error: 'Failed to load SOFIPO data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

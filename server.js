const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { FormData } = require('./db');

// Initialize Redis client and connect
let client;
(async () => {
  try {
     client = redis.createClient({
      host: '127.0.0.1',
      port: 6379
    });
    
    client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
    
    await client.connect(); // Redis client connection
    console.log('Connected to Redis server');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.post('/submit-form', async (req, res) => {
  try {
    const formData = new FormData(req.body);
    await formData.save();
    res.json({ formData });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/fetch-form', async (req, res) => {
  try {
    // Check Redis cache for form data
    const cachedData = await client.get('form_data');
    if (cachedData) {
      console.log('Fetching form data from cache');
      return res.json(JSON.parse(cachedData)); // Parse JSON before sending
    }

    // If not in cache, fetch from the database
    const formData = await FormData.find();

    // Store the form data in Redis cache for 1 hour (3600 seconds)
    await client.setEx('form_data', 3600, JSON.stringify(formData));

    console.log('Fetching form data from database');
    res.json(formData);
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

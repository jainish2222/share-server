const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { FormData } = require('./db');

// Initialize Redis client and connect
let client;
(async () => {
  try {
    const startConnect = Date.now(); // Start timing for Redis connection
    const redisUrl = process.env.REDIS_URL;
    client = redis.createClient({ url: redisUrl });

    client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    await client.connect(); // Redis client connection
    const endConnect = Date.now(); // End timing for Redis connection
    console.log('Connected to Redis server');
    console.log(`Redis connection time: ${endConnect - startConnect} ms`);
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
    const startSave = Date.now(); // Start timing for form save
    const formData = new FormData(req.body);
    await formData.save();
    const endSave = Date.now(); // End timing for form save
    console.log(`Form save time: ${endSave - startSave} ms`);
    res.json({ formData });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/fetch-form', async (req, res) => {
  try {
    const startFetch = Date.now(); // Start timing for fetch operation

    // Check Redis cache for form data
    const cacheStart = Date.now(); // Start timing for cache fetch
    const cachedData = await client.get('form_data');
    const cacheEnd = Date.now(); // End timing for cache fetch

    if (cachedData) {
      console.log('Fetching form data from cache');
      console.log(`Cache fetch time: ${cacheEnd - cacheStart} ms`);
      return res.json(JSON.parse(cachedData)); // Parse JSON before sending
    }

    // If not in cache, fetch from the database
    const dbStart = Date.now(); // Start timing for DB fetch
    const formData = await FormData.find();
    const dbEnd = Date.now(); // End timing for DB fetch

    // Store the form data in Redis cache for 1 hour (3600 seconds)
    await client.setEx('form_data', 3600, JSON.stringify(formData));

    console.log('Fetching form data from database');
    console.log(`Database fetch time: ${dbEnd - dbStart} ms`);

    const endFetch = Date.now(); // End timing for fetch operation
    console.log(`Total fetch time: ${endFetch - startFetch} ms`);

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

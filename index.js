const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000; // Define the port for your proxy server

// Define the target server
const target = 'https://maps.googleapis.com'; // Replace with the URL you want to proxy to

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy middleware
app.use(
  '/proxy', // Route to proxy requests (e.g., http://localhost:3000/proxy)
  createProxyMiddleware({
    target: target, // The target server
    changeOrigin: true, // Update the Host header to match the target server
    pathRewrite: {
      '^/proxy': '', // Remove `/proxy` prefix when forwarding the request
    },
  })
);

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy Server is running at http://localhost:${PORT}`);
});

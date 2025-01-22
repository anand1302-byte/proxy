const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { URL } = require('url'); // Import URL constructor

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    next();
});

console.warn = function() {};

// Proxy endpoint to handle requests
app.use('/proxy', createProxyMiddleware({
    target: '', // Set dynamically from frontend
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req) => {
        try {
            const targetUrl = req.query.url;
            if (targetUrl) {
                proxyReq.path = new URL(targetUrl).pathname;
            }
        } catch (error) {
            console.error('Error in onProxyReq:', error.message);
        }
    },
    router: (req) => {
        try {
            return req.query.url || '';
        } catch (error) {
            console.error('Error in router:', error.message);
            return ''; // Fallback to an empty target
        }
    },
    logLevel: 'debug',
}));

app.get('/', (req, res) => {
    res.send('CORS Proxy is running. Use /proxy?url=YOUR_TARGET_URL');
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).send('An unexpected error occurred.');
});

app.listen(PORT, () => {
    console.log(`CORS Proxy is running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { URL } = require('url'); // Import URL constructor

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

console.warn = function() {};

// Proxy endpoint to handle requests
app.use('/proxy', createProxyMiddleware({
    target: '', // Set dynamically from frontend
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req) => {
        const targetUrl = req.query.url;
        if (targetUrl) {
            proxyReq.path = new URL(targetUrl).pathname;
        }
    },
    router: (req) => req.query.url || '',
    logLevel: 'debug',
}));

app.get('/', (req, res) => {
    res.send('CORS Proxy is running. Use /proxy?url=YOUR_TARGET_URL');
});

app.listen(PORT, () => {
    console.log(`CORS Proxy is running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint to handle requests
app.use(
    '/proxy',
    createProxyMiddleware({
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
        onProxyRes: (proxyRes, req, res) => {
            let body = '';

            // Listen to data chunks from the proxy response
            proxyRes.on('data', (chunk) => {
                body += chunk.toString();
            });

            // After all chunks are received
            proxyRes.on('end', () => {
                try {
                    // Try parsing the response body into JSON
                    const jsonResponse = JSON.parse(body);

                    // Modify the response or add additional data if needed
                    const modifiedResponse = {
                        success: true,
                        originalResponse: jsonResponse,
                        message: 'Response from proxy'
                    };

                    // Send the modified response as JSON
                    res.json(modifiedResponse);
                } catch (err) {
                    // Handle cases where the response isn't JSON
                    res.status(500).json({
                        success: false,
                        error: 'Failed to parse proxy response',
                        details: err.message,
                    });
                }
            });
        }
    })
);

app.get('/', (req, res) => {
    res.send('CORS Proxy is running. Use /proxy?url=YOUR_TARGET_URL');
});

app.listen(PORT, () => {
    console.log(`CORS Proxy is running on http://localhost:${PORT}`);
});
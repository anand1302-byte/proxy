// Suppress Deprecation Warnings
process.noDeprecation = true;

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint to handle requests
app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({
            success: false,
            message: 'Missing "url" query parameter.',
        });
    }

    try {
        const parsedUrl = new URL(targetUrl);

        // Choose the correct module (http or https)
        const httpModule = parsedUrl.protocol === 'https:' ? https : http;

        // Forward the request to the target URL
        const proxyRequest = httpModule.request(
            {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: req.method,
                headers: req.headers,
            },
            (proxyResponse) => {
                let body = '';

                // Collect data chunks from the proxy response
                proxyResponse.on('data', (chunk) => {
                    body += chunk;
                });

                // When all chunks are received
                proxyResponse.on('end', () => {
                    try {
                        const jsonResponse = JSON.parse(body);

                        // Modify the response or add additional data if needed
                        const modifiedResponse = {
                            success: true,
                            originalResponse: jsonResponse,
                            message: 'Response from proxy',
                        };

                        // Send the modified response
                        res.json(modifiedResponse);
                    } catch (err) {
                        // Handle cases where the response isn't JSON
                        res.status(502).json({
                            success: false,
                            error: 'Failed to parse proxy response',
                            details: err.message,
                        });
                    }
                });
            }
        );

        // Handle request errors
        proxyRequest.on('error', (err) => {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch target URL',
                details: err.message,
            });
        });

        // Forward request body (if any) to the target server
        req.pipe(proxyRequest);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Invalid URL',
            details: err.message,
        });
    }
});

// Root route to indicate the proxy is running
app.get('/', (req, res) => {
    res.send('CORS Proxy is running. Use /proxy?url=YOUR_TARGET_URL');
});

// Start the server
app.listen(PORT, () => {
    console.log(`CORS Proxy is running on http://localhost:${PORT}`);
});

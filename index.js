const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

app.use('/proxy', createProxyMiddleware({
    target: 'https://maps.googleapis.com',
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '', // Removes '/proxy' prefix
    },
}));

app.listen(8080, () => console.log('CORS Proxy running on http://localhost:8080'));

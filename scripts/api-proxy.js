#!/usr/bin/env node
/**
 * 简易 API 代理服务器
 * 将 /api/* 请求代理到 http://localhost:8081
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGET = 'http://localhost:8081';
const PORT = 3001;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const targetUrl = `${TARGET}${url.pathname}${url.search}`;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname} -> ${targetUrl}`);
  
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:8081'
    }
  };
  
  const proxyReq = (TARGET.startsWith('https') ? https : http).request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy Error:', err.message);
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API 服务不可用' }));
  });
  
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`🚀 API Proxy running on http://localhost:${PORT}`);
  console.log(`   Forwarding to ${TARGET}`);
});

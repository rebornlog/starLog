const http = require('http');

const PORT = process.env.PORT || 3001;
const TARGET = 'http://localhost:8081';

const server = http.createServer((req, res) => {
  const url = req.url;
  
  // 代理 API 请求
  if (url.startsWith('/api/')) {
    const targetUrl = url.replace('/api/', '/api/');
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: targetUrl,
      method: req.method,
      headers: req.headers
    };
    
    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    });
    
    proxy.on('error', (e) => {
      console.error('Proxy Error:', e.message);
      res.writeHead(503);
      res.end(JSON.stringify({ error: 'API 服务不可用' }));
    });
    
    req.pipe(proxy);
    return;
  }
  
  // 静态文件和其他请求交给 Next.js
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 API Proxy running on http://localhost:${PORT}`);
});

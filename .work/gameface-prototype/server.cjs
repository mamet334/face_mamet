const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const server = http.createServer((req, res) => {
  const requested = req.url === '/' ? '/index.html' : req.url;
  const file = path.join(root, path.normalize(requested).replace(/^([.][.][/\\])+/, ''));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
server.listen(4173, '127.0.0.1', () => console.log('GameFace preview: http://127.0.0.1:4173/'));

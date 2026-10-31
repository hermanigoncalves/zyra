// Servidor estático local para dist/, sem dependências. Uso: npm run dev (gera o site e serve)
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 8685;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon'
};
const send = (res, status, file) => fs.readFile(file, (err, data) => {
  if (err) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}).end('Não encontrado'); return; }
  res.writeHead(status, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
  res.end(data);
});

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403).end('Proibido'); return; }
  fs.stat(file, (err, stat) => {
    if (!err && stat.isDirectory()) {
      if (!urlPath.endsWith('/')) { res.writeHead(301, {Location: urlPath + '/'}).end(); return; }
      file = path.join(file, 'index.html');
    }
    fs.access(file, missing => send(res, missing ? 404 : 200, missing ? path.join(root, '404.html') : file));
  });
}).listen(port, () => console.log(`Lua Belly rodando em http://localhost:${port}`));

// 정적 빌드(out/)를 검사용으로 띄운다. node scripts/serve-static.mjs <폴더> <포트>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2], port = Number(process.argv[3]);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.md': 'text/markdown; charset=utf-8' };
http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { const nf = path.join(root, '404.html'); res.writeHead(404); res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : ''); return; }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('serving', root, port));

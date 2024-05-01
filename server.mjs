import { createServer } from 'https';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import { readFileSync } from 'fs';

const port = 3000; // порт, на котором будет работать сервер
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
    key: readFileSync('/Users/torekhanmukhtarov/server.key', 'utf8'),
    cert: readFileSync('/Users/torekhanmukhtarov/server.cert', 'utf8')
};

app.prepare().then(() => {
  createServer(options, (req, res) => {
    // Parse the URL to handle the Next.js request
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
  });
});

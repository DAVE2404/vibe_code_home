import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = process.env.PORT || 3001;
const buildPath = path.join(__dirname, '..', 'build');

app.use(
  '/api',
  createProxyMiddleware({
    target: process.env.API_TARGET || 'http://localhost:8080',
    changeOrigin: true
  })
);

app.use(express.static(buildPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

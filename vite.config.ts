import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { generateRomanNames } from './src/lib/generateRomanNames';

function deepseekApiPlugin(apiKey: string, model: string): Plugin {
  return {
    name: 'deepseek-generate-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-roman-names', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            if (!apiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'NO_API_KEY' }));
              return;
            }

            const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as {
              description?: string;
            };
            const result = await generateRomanNames({
              apiKey,
              description: typeof body.description === 'string' ? body.description : '',
              model,
            });

            if (!result.ok) {
              res.statusCode = result.status;
              res.end(
                JSON.stringify({
                  error: result.error,
                  detail: result.detail,
                }),
              );
              return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ names: result.names }));
          } catch (err) {
            console.error('Local generate API error:', err);
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                error: 'INTERNAL_ERROR',
                detail: String(err),
              }),
            );
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.DEEPSEEK_API_KEY?.trim() ?? '';
  const model = env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';

  return {
    plugins: [react(), deepseekApiPlugin(apiKey, model)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});

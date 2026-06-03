import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUser = env.GRANDLYON_USER ?? env.VITE_GRANDLYON_USER ?? '';
  const apiPassword =
    env.GRANDLYON_PASSWORD ?? env.VITE_GRANDLYON_PASSWORD ?? '';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/siri': {
          target: 'https://data.grandlyon.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(/^\/api\/siri/, '/siri-lite/2.0'),
          auth: `${apiUser}:${apiPassword}`,
        },
        '/api/traffic': {
          target: 'https://data.grandlyon.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(
              /^\/api\/traffic/,
              '/fr/geoserv/ogc/features/v1/collections/metropole-de-lyon:pvo_patrimoine_voirie.pvotrafic',
            ),
        },
      },
    },
  };
});

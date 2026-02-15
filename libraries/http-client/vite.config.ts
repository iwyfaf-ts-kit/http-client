import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      viteStaticCopy({
        targets: [{ src: 'src/types', dest: './' }],
      }),
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
        fileName: (format) => `index.${format}.js`,
        formats: ['es'],
      },
      rollupOptions: {},
      sourcemap: mode === 'development',
    },
  };
});

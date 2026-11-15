import { defineConfig } from 'vite';

export default defineConfig({
    // Relative base so the build runs from any sub-path (e.g. GitHub Pages).
    base: './',
    build: {
        target: 'es2023',
        assetsDir: 'static',
    },
    worker: {
        format: 'es',
    },
});

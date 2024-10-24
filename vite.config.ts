import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import checker from 'vite-plugin-checker';

export default defineConfig({
    plugins: [sveltekit(), checker({ typescript: true })],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        testTimeout: 10 * 60 * 1000, // 10 minutes
    },
});

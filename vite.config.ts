import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Sito interamente statico: le pagine dell'I Ching sono prerenderizzate,
			// il calendario è calcolato nel browser.
			adapter: adapter({ fallback: '404.html' })
		})
	]
});

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
	integrations: [mdx()],
	i18n: {
		defaultLocale: "en",
		locales: ["es", "en"],
		routing: {
			prefixDefaultLocale: false
		}
	},
	prefetch: {
		defaultStrategy: 'viewport'
	}
});
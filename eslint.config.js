import globals from "globals";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import editorconfig from 'eslint-plugin-editorconfig';
import markdown from "eslint-plugin-markdown";


export default [
	{
		ignores: ['.astro/**', 'src/env.d.ts'],
	},
	eslint.configs.recommended,
	editorconfig.configs.all,
	...tseslint.configs.recommended,
	...markdown.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021
			},
		},
		plugins: {
			editorconfig,
			markdown,
		},
		rules: {}
	},
	{
		files: ["**/*.md"],
		processor: "markdown/markdown"
	},
	{
		files: ["**/*.md/*.js"],
		// ...
		rules: {
		}
	}
];
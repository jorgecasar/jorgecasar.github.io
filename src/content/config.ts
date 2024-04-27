import { defineCollection, z } from 'astro:content';

export const collections = {
	talks: defineCollection({
		type: 'content',
		schema: z.object({
			title: z.string(),
			description: z.string(),
			talkDate: z.coerce.date(),
			event: z.object({
				name: z.string(),
				dateStart: z.coerce.date(),
				dateEnd: z.coerce.date(),
			}),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
		}),
	}),
};
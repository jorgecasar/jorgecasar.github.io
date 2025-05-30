import { defineCollection, z } from "astro:content";

export const collections = {
	talks: defineCollection({
		type: "content",
		schema: ({ image }) =>
			z.object({
				title: z.string(),
				description: z.string(),
				talkDate: z.coerce.date(),
				event: z.object({
					name: z.string(),
					dateStart: z.coerce.date(),
					dateEnd: z.coerce.date(),
				}),
				tags: z.array(z.string()),
				img: image(),
				imgAlt: z.string().optional(),
			}),
	}),
	mentions: defineCollection({
		type: "content",
		schema: z.object({
			brand: z.string(),
		}),
	}),
};

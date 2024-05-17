import { enUi, enRoutes } from './en';
import { esUi, esRoutes } from './es';

export const languages = {
	es: 'Español',
	en: 'English',
};

export const defaultLang = 'es';
export const showDefaultLang = false;

export const ui = { es: esUi, en: enUi } as const;

export const routes = {
	es: esRoutes,
	en: enRoutes,
}
import { configureLocalization } from 'https://cdn.skypack.dev/@lit/localize';
// Generated via output.localeCodesModule
import { sourceLocale, targetLocales } from '../../../generated/locale-codes.js';

export const { getLocale, setLocale } = configureLocalization({
	sourceLocale,
	targetLocales,
	loadLocale: (locale) => import(`/generated/locales/${locale}.js`),
});

export const setLocaleFromUrl = async () => {
	const url = new URL(window.location.href);
	const locale = url.searchParams.get('locale') || sourceLocale;
	await setLocale(locale);
};
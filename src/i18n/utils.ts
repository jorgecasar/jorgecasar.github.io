import { ui, defaultLang, showDefaultLang, routes, languages } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

const interpolate = (str = '', data = {}) => str.replace(/{([^{}]*)}/g, (match, key) =>  data[key] ? data[key] : match );


export function useTranslations(lang: keyof typeof ui) {
	return function t(key: keyof typeof ui[typeof defaultLang], data = {}) {
		const str = ui[lang][key] || ui[defaultLang][key];
		return interpolate(str, data);
	}
}

// Add dot/slash replacement for translatedPath
export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
	  const pathName = path?.split("/")
		  .filter(Boolean)
		  .filter((part) => !Object.keys(languages).includes(part))
		  .join(".");
    const hasTranslation =
      defaultLang !== l &&
      routes[l] !== undefined &&
      routes[l][pathName] !== undefined;
	  const translatedPath = hasTranslation ?routes[l][pathName] : pathName;
    const translatedPathReplaced = `/${translatedPath.replaceAll(".", "/")}`;

    return !showDefaultLang && l === defaultLang
      ? `${translatedPathReplaced}`
      : `/${l}${translatedPathReplaced}`;
  };
}

// Add support for multi-tier routes by checking the entire pathname and skipping the language directory
export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = decodeURI(new URL(url)?.pathname);

  const path = pathname
    ?.split("/")
    .filter(Boolean)
    .filter((part) => !Object.keys(languages).includes(part))
    .join(".");

  if (!path) {
    return undefined;
  }

  const currentLang = getLangFromUrl(url);

  if (defaultLang === currentLang) {
    const route = Object.values(routes)[0];
    const pathTyped = path as keyof typeof route;
    return pathTyped in route ? pathTyped : undefined
  }

  const getKeyByValue = (
    obj: Record<string, string>,
    value: string,
  ): string | undefined => {
    return Object.keys(obj).find((key) => obj[key] === value);
  };

  const reversedKey = getKeyByValue(routes[currentLang], path);

  if (reversedKey !== undefined) {
    return reversedKey;
  }

  return undefined;
}
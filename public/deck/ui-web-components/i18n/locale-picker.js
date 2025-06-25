import { html, LitElement } from 'lit';
import { updateWhenLocaleChanges } from '@lit/localize';
import { getLocale, setLocaleFromUrl } from './localization.js';
import { allLocales } from '../../../generated/locale-codes.js';

const localeNames = {
	en: 'English',
	es: 'Español',
};

export class LocalePicker extends LitElement {
	constructor() {
		super();
		updateWhenLocaleChanges(this);
	}
	render() {
		return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map((locale) => html`<option value=${locale} ?selected=${locale === getLocale()}>
			${localeNames[locale]}
		</option>`)}
      </select>
    `;
	}

	localeChanged(event) {
		const newLocale = event.target.value;
		if (newLocale !== getLocale()) {
			const url = new URL(window.location.href);
			url.searchParams.set('locale', newLocale);
			window.history.pushState(null, '', url.toString());
			setLocaleFromUrl();
		}
	}
}
customElements.define('locale-picker', LocalePicker);
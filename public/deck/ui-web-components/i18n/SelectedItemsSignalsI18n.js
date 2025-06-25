import { SignalWatcher, watch } from '@lit-labs/signals';
import { html, LitElement } from 'lit';
import { msg, updateWhenLocaleChanges } from '@lit/localize';
import { count } from '../manage-data/signalCount.js';
import './locale-picker.js';

export class SelectedItemsSignalsI18n extends SignalWatcher(LitElement) {

	constructor() {
		super();
		updateWhenLocaleChanges(this);
	}

	render() {
		const num = watch(count);
		return html`
			<p>${msg(html`Seleccionados: ${num}`)}</p>
			<locale-picker></locale-picker>
		`;
	}
}
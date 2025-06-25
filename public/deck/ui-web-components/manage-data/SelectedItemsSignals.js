import { SignalWatcher, watch } from '@lit-labs/signals';
import { html, LitElement } from 'lit';
import { count } from './signalCount.js';

export class SelectedItemsSignals extends SignalWatcher(LitElement) {

	render() {
		return html`<p>Seleccionados: ${watch(count)}</p>`;
	}
}
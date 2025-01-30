import { SignalWatcher, watch } from 'https://cdn.skypack.dev/@lit-labs/signals';
import { html, LitElement } from 'https://cdn.skypack.dev/lit';
import { count } from './signalCount.js';

export class SelectedItemsSignals extends SignalWatcher(LitElement) {

	render() {
		return html`<p>Selected: ${watch(count)}</p>`;
	}
}
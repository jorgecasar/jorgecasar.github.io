import { SignalWatcher } from '@lit-labs/signals';
import { html, css } from 'lit';
import { ListWithPictureContext } from './ListWithPictureContext.js';
import { count } from './signalCount.js';

export class ListWithPictureSignals extends SignalWatcher(ListWithPictureContext) {

	static styles = [
		super.styles,
		css`.added { background: var(--surface-2); }`
	]

	item = (item) => {
		return html`<list-item @click=${this.#onClick}>
			<img slot="picture" .src=${item.picture} />
			<h3>${item.name}</h3>
		</list-item>`;
	}

	#onClick(event) {
		const { classList } = event.currentTarget;
		if (classList.contains('added')) {
			count.set(count.get() - 1);
			classList.remove('added');
		} else {
			count.set(count.get() + 1);
			classList.add('added');
		}
	}
}
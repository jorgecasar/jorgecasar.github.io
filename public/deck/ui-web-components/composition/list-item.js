import { html, css, LitElement } from 'https://cdn.skypack.dev/lit';

export class ListItem extends LitElement {
	static styles = css`
		:host {
			display: grid;
			grid-template-columns: 100px auto;
			flex-direction: row;
			gap: var(--size-3);
		}

		::slotted(*) {
			max-inline-size: 100% !important;
			max-block-size: 100%;
			text-align: left;
		}

		slot[name="picture"] {
			max-block-size: var(--size-12);
		}

		slot:not([name]) {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
    		align-items: flex-start;
		}
	`;

	render() {
		return html`
			<slot name="picture"></slot>
			<slot></slot>
		`;
	}
}
customElements.define('list-item', ListItem);
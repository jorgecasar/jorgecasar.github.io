import { html, css, LitElement } from 'lit';

class SimpleGreetingLit extends LitElement {
	static styles = css`
		p {
			color: var(--accent-regular);
		}
	`;

	static properties = {
		name: { type: String },
	};

	constructor() {
		super();
		this.name = 'alguien';
	}

	render() {
		return html`<p>Hola, ${this.name}!</p>`;
	}
}
customElements.define('simple-greeting-lit', SimpleGreetingLit);
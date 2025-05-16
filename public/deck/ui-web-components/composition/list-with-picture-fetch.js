import { html, nothing } from 'https://cdn.skypack.dev/lit';
import { FetchController } from './FetchController.js';
import './list-with-picture.js';
import { ListWithPicture } from './ListWithPicture.js';

class ListWithPictureFetch extends ListWithPicture {

	data = new FetchController(this, () => this.endpoint);

	static properties = {
		value: { type: String }
	};

	get endpoint() {
		if (!this.value) {
			return '';
		}
		return `/deck/ui-web-components/data/${this.value}.json`;
	}

	update(changedProperties) {
		super.update(changedProperties);
		this.items = this.data.value;
	}

	render() {
		return html`
			${this.renderSelect()}
			${super.render()}
		`;
	}

	renderSelect() {
		return html`<select @change=${this.handleChange}>
			<option ?selected=${this.value === ''} value="">Select Endpoint</option>
			<option ?selected=${this.value === 'artists'} value="artists">Artists</option>
			<option ?selected=${this.value === 'ccaa'} value="ccaa">CCAA</option>
			<option ?selected=${this.value === 'error'} value="error">Error</option>
		</select>`;
	}

	handleChange = (event) => {
		this.value = event.target.value;
	}
}
customElements.define('list-with-picture-fetch', ListWithPictureFetch);
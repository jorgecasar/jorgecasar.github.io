import { html } from 'lit';
import { listWithPictureStyles } from './listWithPictureStyles.css.js';
import './list-item.js';

export const ListWithPictureMixin = (superClass) => class extends superClass {

	static styles = listWithPictureStyles;

	error() {
		return html`<p class="error">There was an error</p>`;
	}

	pending() {
		return html`<p>Loading...</p>`
	}

	complete = (items) => {
		if (items.length) {
			return items.map(this.item);
		}
		return this.empty();
	}

	empty() {
		return html`<p>There are no content</p>`;
	}

	item = (item) => {
		return html`<list-item>
			<img slot="picture" .src=${item.picture} />
			<h3>${item.name}</h3>
		</list-item>`;
	}
};
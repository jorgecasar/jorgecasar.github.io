import { LitElement } from 'https://cdn.skypack.dev/lit';
import { ListWithPictureMixin } from './ListWithPictureMixin.js';

export class ListWithPicture extends ListWithPictureMixin(LitElement) {

	static properties = {
		items: { type: Array },
	};

	constructor() {
		super();
		this.items = [];
	}

	render() {
		if (this.items) {
			return this.complete(this.items)
		}
		return this.error();
	}
}
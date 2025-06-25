import { Task } from '@lit/task';
import { LitElement } from 'lit';

import { ListWithPictureMixin } from '../composition/ListWithPictureMixin.js';

export class ListWithPictureTask extends ListWithPictureMixin(LitElement) {

	static properties = {
		endpoint: { type: String },
	}

	task = new Task(this, {
		args: () => [this.endpoint],
		task: async ([endpoint], { signal }) => {
			const response = await fetch(endpoint, { signal });
			if (!response.ok) { throw new Error(response.status); }
			return response.json();
		}
	});

	render() {
		if (this.task) {
			return this.task.render({
				pending: this.pending,
				complete: this.complete,
				error: this.error
			});
		}
		return this.empty();
	}
}
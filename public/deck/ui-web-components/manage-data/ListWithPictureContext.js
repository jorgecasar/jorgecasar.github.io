import { ContextConsumer } from 'https://cdn.skypack.dev/@lit/context';
import { LitElement } from 'https://cdn.skypack.dev/lit';
import { contextList } from './contextList.js';
import { ListWithPictureMixin } from '../composition/ListWithPictureMixin.js';

export class ListWithPictureContext extends ListWithPictureMixin(LitElement) {

	context = new ContextConsumer(this, {
		context: contextList,
		subscribe: true,
		callback: (taskFactory) => {
			this.task = taskFactory(this);
		}
	});

	render() {
		if (this.task) {
			return this.task.render(this);
		}
		return this.empty();
	}
}
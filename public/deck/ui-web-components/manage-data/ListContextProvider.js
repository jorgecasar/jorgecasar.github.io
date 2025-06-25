import { ContextProvider } from '@lit/context';
import { Task } from '@lit/task';
import { LitElement, html } from 'lit';
import { contextList } from './contextList.js';

export class ListContextProvider extends LitElement {

	#context = new ContextProvider(this, {
		context: contextList
	});

	context = 'No implementado';

	static properties = {
		context: { type: String },
	};

	task = async () => {
		throw new Error('Task not implemented');
	}

	taskFactory = (host) => new Task(host, {
		task: this.task,
		args: () => []
	});

	constructor() {
		super();
		this.#context.setValue(this.taskFactory);
	}

	render() {
		return html`<slot>
			<p>Drop a component to provide the context</p>
			<p>${this.context}</p>
		</slot>`;
	}
}
export class FetchController {

	constructor(host, endpointFn) {
		(this.host = host).addController(this);
		this.endpointFn = endpointFn;
	}

	hostUpdated() {
		const endpoint = this.endpointFn();
		if (endpoint !== this._previousEndpoint) {
			this.run(endpoint);
		}
	}

	async run(endpoint) {
		if (endpoint) {
			try {
				this.value = await fetch(endpoint)
					.then(response => response.json());
			} catch (error) {
				console.error(error);
				this.value = null;
			}
		} else {
			this.value = [];
		}
		this._previousEndpoint = endpoint;
		this.host.requestUpdate();
	}
}
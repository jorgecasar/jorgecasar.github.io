export class ClockController {
	host;

	value = new Date();
	timeout;
	#timerID;

	constructor(host, timeout = 1000) {
		(this.host = host).addController(this);
		this.timeout = timeout;
	}

	hostConnected() {
		// Start a timer when the host is connected
		this.#timerID = setInterval(() => {
			this.value = new Date();
			// Update the host with new value
			this.host.requestUpdate();
		}, this.timeout);
	}

	hostDisconnected() {
		// Clear the timer when the host is disconnected
		clearInterval(this.#timerID);
		this.#timerID = undefined;
	}
}
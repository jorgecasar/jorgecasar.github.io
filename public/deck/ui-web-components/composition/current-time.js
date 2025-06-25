import { LitElement, html } from 'lit';
import { ClockController } from './ClockController.js';

class CurrentTime extends LitElement {
	// Create the controller and store it
	clock = new ClockController(this, 100);

	// Use the controller in render()
	render() {
		return html`Current time: ${timeFormat.format(this.clock.value)}`;
	}
}
customElements.define('current-time', CurrentTime);

const timeFormat = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
});
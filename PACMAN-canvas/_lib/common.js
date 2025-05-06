export class Common {
	#eventTarget
	constructor({eventTarget}={eventTarget:null}) {
		this.#eventTarget = eventTarget || this
	}
	/**
	 * @param {*} events}
	 * @param {Function} [fn]
	 */
	bind(events, fn) {
		$(this.#eventTarget).on(events, fn)
		return this
	}
	/** @param {string} event */
	trigger(event, data) {
		$(this.#eventTarget).trigger(event, data)
		return this
	}
}
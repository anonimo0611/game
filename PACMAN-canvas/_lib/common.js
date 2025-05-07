export class Common {
	#eventTarget
	/** @param {{eventTarget?:any}} [cfg] */
	constructor({eventTarget}={}) {
		this.#eventTarget = eventTarget ?? this
	}
	/**
	 * @param {*} events}
	 * @param {Function} [fn]
	 */
	bind(events, fn) {
		$(this.#eventTarget).on(events, fn)
		return this
	}
	/**
	 * @param {string} event
	 * @param {*} [data]
	 */
	trigger(event, data) {
		$(this.#eventTarget).trigger(event, data)
		return this
	}
}
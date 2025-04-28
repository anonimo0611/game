export class Common {
	#eventTarget
	constructor({eventTarget}={}) {
		this.#eventTarget = eventTarget || this
	}
	/**
	 * @param {Object.<string,Function>|string} arg}
	 * @param {Function} [fn]
	 */
	bind(arg, fn) {
		$(this.#eventTarget).on(arg, fn)
		return this
	}
	/** @param {string} event */
	trigger(event, data) {
		$(this.#eventTarget).trigger(event, data)
		return this
	}
}
export class Common {
	#eventTarget
	constructor({eventTarget}={}) {
		this.#eventTarget = eventTarget || this
	}
	/**
	 * @param {Object.<string,function>|string} arg}
	 * @param {function} [fn]
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
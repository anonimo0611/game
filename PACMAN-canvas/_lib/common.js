export class Common {
	#eventTarget
	/** @param {{eventTarget?:unknown}} [cfg] */
	constructor({eventTarget}={}) {
		this.#eventTarget = eventTarget ?? this
	}
	/**
 	 * @param {string|object} arg
	 * @param {Function} [fn]

	 * @overload
	 * @param   {string} arg
	 * @param   {Function} fn
	 * @returns {this}

	 * @overload
	 * @param   {Object.<string,Function>} arg
	 * @returns {this}
	 */
	on(arg, fn) {
		typeof(arg) == 'object'
			? $(this.#eventTarget).on(arg)
			: $(this.#eventTarget).on(arg, fn)
		return this
	}
	/**
	 * @param {string} event
	 * @param {number|string|boolean|any[]} [data]
	 */
	trigger(event, data) {
		$(this.#eventTarget).trigger(event, data)
		return this
	}
}
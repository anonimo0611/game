export class Common {
	/** @type  {any} */#target
	/** @param {{eventTarget?:any}} [cfg] */
	constructor({eventTarget}={}) {
		this.#target = eventTarget ?? this
	}
	/**
 	 * @param {string|Object.<string,Function>} arg
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
		typeof(arg) == 'string'
			? $(this.#target).on(arg, ()=>fn?.())
			: $(this.#target).on(arg)
		return this
	}
	/** @param {string} eventType */
	off(eventType) {
		$(this.#target).off(eventType)
	}
	/**
	 * @param {string} event
	 * @param {number|string|boolean|any[]} [data]
	 */
	trigger(event, data) {
		$(this.#target).trigger(event, data)
		return this
	}
}
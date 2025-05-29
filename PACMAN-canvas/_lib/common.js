export class Common {
	#target
	/** @param {{eventTarget?:any}} [cfg] */
	constructor({eventTarget}={}) {
		this.#target = eventTarget ?? this
	}

	/**
 	 * @param {string|{[event:string]:Function}} arg
	 * @param {Function} [fn]

	 * @overload
	 * @param   {string} arg
	 * @param   {Function} fn
	 * @returns {this}

	 * @overload
	 * @param   {{[event:string]:Function}} arg
	 * @returns {this}
	 */
	on(arg, fn) {
		typeof(arg) == 'object'
			? $(this.#target).on(arg)
			: $(this.#target).on({[arg]:fn})
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
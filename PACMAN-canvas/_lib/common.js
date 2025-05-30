export class Common {
	#target
	/** @param {{eventTarget?:any}} [cfg] */
	constructor({eventTarget}={}) {
		this.#target = eventTarget ?? this
	}

	/**
 	 * @param {string|{[event:string]:Function}} arg
	 * @param {Function} [fn]
	 * @type {((event:string, fn:Function)=> this) & ((arg:{[event:string]:Function})=> this)}
	 */
	on = (arg, fn)=> {
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
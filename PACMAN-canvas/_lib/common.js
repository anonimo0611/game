export class Common {
	#target
	/** @param {{eventTarget?:any}} [cfg] */
	constructor({eventTarget}={}) {
		this.#target = eventTarget ?? this
	}

	/** @param {{[event:string]:(e:JQuery.TriggeredEvent)=> any}} arg */
	on(arg) {
		$(this.#target).on(arg)
		return this
	}

	/** @param {{[event:string]:(e:JQuery.TriggeredEvent)=> any}} arg */
	offHandlers(arg) {
		$(this.#target).off(arg)
		return this
	}

	/** @param {string} ev */
	off(ev) {
		$(this.#target).off(ev)
		return this
	}

	/**
	 @param {string} event
	 @param {number|string|boolean|any[]} [data]
	*/
	trigger(event, data) {
		$(this.#target).trigger(event, data)
		return this
	}
}
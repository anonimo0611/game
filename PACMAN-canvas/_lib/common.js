export class Common {
	#target
	/**
	 @param {{eventTarget?:any}} [cfg]
	*/
	constructor({eventTarget}={}) {
		this.#target = eventTarget ?? this
	}

	/**
	 @param {{[event:string]:(e:JQuery.TriggeredEvent)=>any}} arg
	*/
	on(arg) {
		$(this.#target).on(arg)
		return this
	}

	/**
	 @param {string} eventType
	*/
	off(eventType) {
		$(this.#target).off(eventType)
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
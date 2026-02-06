export class Common {
	#target
	/** @param {*} [eventTarget] */
	constructor(eventTarget=this) {
		this.#target = eventTarget
	}

	/** @param {JQTriggerHandlers} arg */
	on(arg) {
		$(this.#target).on(arg)
		return this
	}

	/**
	 @overload @param {string} ev @returns {this}
	 @overload @param {JQTriggerHandlers} ev @returns {this}
	 @param {string|JQTriggerHandlers} ev
	*/
	off(ev) {
		typeof ev == 'string'
			? $(this.#target).off(ev)
			: $(this.#target).off(ev)
		return this
	}

	/**
	 @param {string}   events
	 @param {JQTriggerHandler} handler
	 @param {boolean} [force]
	*/offon(events, handler, force) {
		$(this.#target).offon(events, handler, force)
		return this
	}

	/**
	 @param {string} event
	 @param {JQData} [data]
	*/
	trigger(event, data) {
		$(this.#target).trigger(event, data)
		return this
	}
}
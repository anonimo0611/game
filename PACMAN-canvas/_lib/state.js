/**
 @template Owner
 @template {string} S
*/
export default class StateBase {
	#owner
	#last     = /**@type {?S}*/(null)
	#curr     = /**@type {S} */('')
	#default  = /**@type {S} */('')

	/** @readonly */
	#eventBus = $({})

	/** @protected @param {Owner} owner */
	constructor(owner) {this.#owner = owner}

	get owner()   {return this.#owner}
	get current() {return this.#curr}
	get last()    {return this.#last}
	get default() {return this.#default}

	/** @param {readonly S[]} states */
	init(states) {
		states?.forEach((/**@type {S}*/s,i)=> {
			const self = /**@type {any}*/(this)
			i == 0 && (this.#default = s)
			self[`to${s}`] = (/**@type {StateDef.Opts<S>}*/opt)=> {this.to(s,opt)}
			defineProperty(this,`is${s}`, {get(){return this.#curr === s}})
			defineProperty(this,`was${s}`,{get(){return this.#last === s}})
		})
		return this
	}

	/** @param {S} state */
	is(state) {
		return this.#curr == state
	}

	/** @param {S} [state] */
	was(state) {
		return state === this.#last
	}

	/** @param {JQWindowHandlers} v */
	on(v) {
		for (const [ev,fn] of entries(v))
			$win.on(underscoreToSp(ev,String(this.default)), fn)
		return this
	}

	/** @param {JQTriggerHandler} handler */
	onChange(handler) {
		$(this.#eventBus).on('change', handler)
	}

	/**
	 @param {S} state
	 @param {StateDef.Opts<S>} opts
	*/
	to(state, {data,delay=-1,fn}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		this.#last = this.current
		this.#curr = state
		fn?.(state,data)
		$(this.#eventBus).trigger('change')
		return this
	}
}
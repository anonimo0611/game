/**
 @template {string} S
 @template {object} Owner
*/
export default class StateBase {
	#owner
	#last    = /**@type {?S}*/(null)
	#curr    = /**@type {S} */('')
	#default = /**@type {S} */('')

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
			self[`set${s}`] = (/**@type {StateDef.Opts<S>}*/opt)=> {this.set(s,opt)}
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

	/** @param {JQTriggerHandler} handler */
	onChange(handler) {
		this.#eventBus.on('change', handler)
		return this
	}

	/** @param {{[key in S]?:JQTriggerHandler}} o */
	onBefore(o) {
		for (const [state,fn] of entries(o))
			$(this.#eventBus).on('before'+state, fn)
		return this
	}

	/** @param {{[key in S]?:JQTriggerHandler}} o */
	on(o) {
		for (const [state,fn] of entries(o))
			$(this.#owner).on(underscoreToSp(state,String(this.default)), fn)
		return this
	}

	/**
	 @protected
	 @param {S} state
	 @param {JQData} [data]
	*/
	callback(state, data) {
		$(this.owner).trigger(state, data)
	}

	/**
	 @param {S} state
	 @param {StateDef.Opts<S>} opts
	*/
	set(state, {data,delay=-1,fn=this.callback}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.set(state,{delay:-1,data,fn}))
			return this
		}
		this.#eventBus.trigger('before'+state)
		this.#last = this.current
		this.#curr = state
		this.#eventBus.trigger('change')
		fn?.call(this,state,data)
		return this
	}
}
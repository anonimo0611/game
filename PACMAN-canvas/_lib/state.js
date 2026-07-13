/**
 @template {string} S
 @template {readonly [S,...S[]]} States
 @template {object} Owner
*/
export class AState {
	#last = /**@type {S}*/('')
	#curr = /**@type {S}*/('')

	/** @readonly */owner
	/** @readonly */immediately
	/** @readonly */default = /**@type {States[0]}*/('')
	/** @readonly */#eventBus = $({})

	/**
	 @protected
	 @typedef {`_${Exclude<S,States[0]>}`} Underscored
	 @param {Owner}  owner
	 @param {States} states
	 @param {{immediately?:boolean,defaultState?:S}} opts
	*/
	constructor(owner, states,
		{immediately=false, defaultState=states[0]}={}
	) {
		this.owner   = owner
		this.default = defaultState
		this.immediately = immediately
		states?.forEach((/**@type {S}*/s,i)=> {
			const self = /**@type {any}*/(this)
			self[`set${s}`] = (/**@type {StateDef.Opts<S>}*/opt)=> {this.set(s,opt)}
			defineProperty(this,`is${s}`, {get(){return this.#curr === s}})
			defineProperty(this,`was${s}`,{get(){return this.#last === s}})
		})
	}
	get current() {return this.#curr}
	get last()    {return this.#last}

	/** @param {S[]} states */
	is(...states) {
		return states.includes(this.current)
	}

	/** @param {S} state */
	was(state) {
		return state == this.last
	}

	/** @param {JQTriggerHandler} handler */
	onChange(handler) {
		this.#eventBus.on('change', handler)
		return this
	}

	/** @param {{[key in S]?:JQTriggerHandler}} o */
	onBefore(o) {
		for (const [state,cb] of entries(o))
			$(this.#eventBus).on('before'+state, cb)
		return this
	}

	/** @param {{[key in (S|Underscored)]?:JQTriggerHandler}} o */
	on(o) {
		for(const [state,cb] of entries(o)) {
			const prefix = (state.trim()[0] == '_')? this.default : ''
			$(this.owner).on(underscoreToSp(state,prefix), cb)
		}
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
	set(state, {data,delay=0,cb=this.callback}={}) {
		if (this.immediately) {
			delay ||= -1
		}
		if (delay >= 0) {
			Timer.set(delay, ()=> this.set(state,{delay:-1,data,cb}))
			return this
		}
		this.#eventBus.trigger('before'+state)
		this.#last = this.current
		this.#curr = state
		cb?.call(this,state,data)
		this.#eventBus.trigger('change', state)
		return this
	}
}
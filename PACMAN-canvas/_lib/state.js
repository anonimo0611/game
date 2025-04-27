export default class {
	#state = ''
	#last  = ''
	#Enum  = Object.create(null)
	get current() {return this.#state}

	/** @param {string} state */
	init(state) {
		entries(this).forEach(([key,val])=> {
			const state = key.match(/^is([A-Z][a-zA-Z\d]*)$/)?.[1]
			if (!state) return; this.#Enum[state] = state
			if (this.#state === '' && val === true) this.#state = state
			defineProperty(this, key, {get(){return this.#state === state}})
		})
		freeze(this.#Enum)
		hasOwn(this.#Enum, state) && this.to(state)
	}

	/**
	 * @param {string} state
	 * @param {{data:any,delay?:number,fn?:function}}
	 */
	to(state, {data,delay=-1,fn}={}) {
		if (!hasOwn(this.#Enum, state))
			throw ReferenceError(`State '${state}' is not defined`)
		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		;[this.#last,this.#state]=[this.current,state]
		isFun(fn) && fn(state,data)
		return this
	}

	/** @param {string} state */
	last(state) {
		return state? (state === this.#last ? this.#last : '') : this.#last
	}
}
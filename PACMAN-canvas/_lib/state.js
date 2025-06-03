export default class {
	#state = ''
	#last  = ''

	/** @readonly */
	#StateSet = /**@type {Set<string>}*/(new Set)

	get current() {return this.#state}

	/** @param {string} [state] */
	init(state) {
		entries(this)
		.flatMap(([k,v])=> /^is[A-Z\d]*$/i.test(k)? [{k,v:(!!v)}]:[])
		.forEach(({k,v})=> {
			const state = k.substring(2)
			this.#StateSet.add(state)
			v === true && this.to(state)
			defineProperty(this,k,{get(){return this.#state === state}})
		})
		state && this.#StateSet.has(state) && this.to(state)
	}

	/**
	 * @param {string} state
	 * @param {{data?:unknown,delay?:number,fn?:Function}} config
	 */
	to(state, {data,delay=-1,fn}={}) {
		if (!this.#StateSet.has(state))
			throw TypeError(`State \`${state}\` is not defined`)

		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		this.#last  = this.current
		this.#state = state
		fn?.(state,data)
		return this
	}

	/** @param {string} [state] */
	last(state) {
		const last = this.#last
		return state? (state === last ? last:'') : last
	}
}
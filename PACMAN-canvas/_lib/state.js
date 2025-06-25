export default class {
	#state = ''
	#last  = ''

	/** @readonly */
	#StateSet = /**@type {Set<string>}*/(new Set)
	get current() {return this.#state}

	/** @param {string} [initVal] */
	init(initVal) {
		keys(this)
		.flatMap(key=> /^is[A-Z\d]*$/i.test(key)? [key]:[])
		.forEach(key=> {
			const state = key.substring(2)
			this.#StateSet.add(state)
			defineProperty(this,key,{get(){return this.#state === state}})
		})
		initVal && this.#StateSet.has(initVal) && this.to(initVal)
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

	/**
	 * @param {string} [state]
	 * @returns {string}
	 */
	last(state) {
		const last = this.#last
		return state? (state === last ? last:'') : last
	}
}
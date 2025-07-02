export default class {
	#state   = ''
	#last    = ''
	#default = ''

	/** @readonly */
	#StateSet = /**@type {Set<string>}*/(new Set)
	get current() {return this.#state}
	get default() {return this.#default}

	/** @param {string} [defaultVal] */
	init(defaultVal) {
		keys(this)
		.flatMap(key=> /^is[A-Z\d]*$/i.test(key)? [key]:[])
		.forEach((key,i)=> {
			const state = key.substring(2)
			this.#StateSet.add(state)
			i == 0 && (this.#default = state)
			defineProperty(this,key,{get(){return this.#state === state}})
		})
		defaultVal
			&& this.#StateSet.has(defaultVal)
			&& this.to(this.#default = defaultVal)
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
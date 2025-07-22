/** @template O,S */
export default class _State {
	/** @type {O} */#owner
	/** @type {S} */#state
	/** @type {S} */#last

	/** @type {string} */#default

	/** @readonly */
	#StateSet = /**@type {Set<string>}*/(new Set)

	/** @param {O} owner */
	constructor(owner) {this.#owner = owner}
	get owner()   {return this.#owner}
	get current() {return this.#state}
	get default() {return this.#default}

	init() {
		keys(this)
		.flatMap(key=> /^is[A-Z][a-zA-Z\d]*$/.test(key)? [key]:[])
		.forEach((key,i)=> {
			const state = key.substring(2)
			this.#StateSet.add(state)
			i == 0 && (this.#default = state)
			defineProperty(this,key,{get(){return this.#state === state}})
		})
		return this
	}

	/**
	 * @param {S} state
	 * @param {{data?:unknown,delay?:number,fn?:Function}} config
	 */
	to(state, {data,delay=-1,fn}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		this.#last  = this.current
		this.#state = state
		fn?.(state,data)
		return this
	}

	/** @param {{[key:string]:JQWindowHandler}} v */
	on(v) {
		entries(v).forEach(([ev,fn])=> $win.on(_toSp(ev,this.default), fn))
		return this
	}

	/**
	 * @param {S} [state]
	 * @returns {S|''}
	 */
	last(state) {
		const last = this.#last ?? ''
		return state? (state === last ? last:'') : last
	}
}
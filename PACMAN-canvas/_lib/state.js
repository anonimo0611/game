/** @template Owner,State */
export default class _State {
	/**@type {Owner} */ #owner
	/**@type {State} */ #state
	/**@type {State} */ #last
	/**@type {string}*/ #default

	/** @param {Owner} owner */
	constructor(owner) {this.#owner = owner}
	get owner()   {return this.#owner}
	get current() {return this.#state}
	get default() {return this.#default}

	init() {
		keys(this)
		.flatMap(key=> /^is[A-Z][a-zA-Z\d]*$/.test(key)? [key]:[])
		.forEach((key,i)=> {
			const state = key.substring(2)
			i == 0 && (this.#default = state)
			defineProperty(this,key,{get(){return this.#state === state}})
		})
		return this
	}

	/**
	 @param {State} state
	 @param {{data?:unknown,delay?:number,fn?:Function}} config
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

	/**
	 @param {{[key:string]:JQWindowHandler}} v
	*/
	on(v) {
		entries(v).forEach(([ev,fn])=> $win.on(_toSp(ev,this.default), fn))
		return this
	}

	/**
	 @param   {State} [state]
	 @returns {State|''}
	*/
	last(state) {
		const last = this.#last ?? ''
		return state? (state === last ? last:'') : last
	}
}
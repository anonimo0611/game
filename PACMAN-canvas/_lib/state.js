/** @typedef {{delay?:number,data?:number|string|boolean|any[]}} config} */
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
	 @protected
	 @param {State} s
	*/
	ret(s) {
		/** @type {(cfg:config)=> this} */
		return ({delay=0,data}={})=> {
			this.set(s, {delay,data})
			return this
		}
	}

	/**
	 @param {State} state
	 @param {{data?:unknown,delay?:number,fn?:Function}} config
	*/
	set(state, {data,delay=-1,fn}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.set(state,{delay:-1,data}))
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
		for (const [ev,fn] of entries(v))
			$win.on(underscoreToSp(ev,this.default), fn)
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
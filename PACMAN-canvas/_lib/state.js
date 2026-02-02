/**
 @template Owner
 @template {string} State
*/
export default class _State {
	#owner
	#last    = /**@type {?State}*/(null)
	#default = /**@type {State} */('')
	#current = /**@type {State} */('')

	/** @protected @param {Owner} owner */
	constructor(owner) {this.#owner = owner}

	get owner()   {return this.#owner}
	get current() {return this.#current}
	get last()    {return this.#last}
	get default() {return this.#default}

	/** @param {readonly State[]} [states] */
	init(states) {
		states?.forEach((/**@type {State}*/s,i)=> {
			const self = /**@type {any}*/(this)
			i == 0 && (this.#default = s)
			self[`to${s}`] = (/**@type {StateOptions}*/opt)=> this.to(s,opt)
			defineProperty(this,`is${s}`, {get(){return this.#current === s}})
			defineProperty(this,`was${s}`,{get(){return this.#last    === s}})
		})
		return this
	}

	/**
	 @param {State} state
	*/
	is(state) {
		return this.#current == state
	}
	/**
	 @param {State} [state]
	*/
	was(state) {
		return state === this.#last
	}

	/**
	 @param {State} state
	 @param {{data?:JQData,delay?:number,fn?:(state:State,data?:JQData)=>void}} opts
	*/
	to(state, {data,delay=-1,fn}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		this.#last  = this.current
		this.#current = state
		fn?.(state,data)
		return this
	}

	/**
	 @param {{[key:string]:JQWindowHandler}} v
	*/
	on(v) {
		for (const [ev,fn] of entries(v))
			$win.on(underscoreToSp(ev,String(this.default)), fn)
		return this
	}
}
/**
 @import {StateDef as Def} from "./_state.d.ts"
 @template Owner
 @template {string} State
*/
class StateBase {
	#owner
	#eventBus = $({})
	#last     = /**@type {?State}*/(null)
	#curr     = /**@type {State} */('')
	#default  = /**@type {State} */('')

	/** @protected @param {Owner} owner */
	constructor(owner) {this.#owner = owner}

	get owner()   {return this.#owner}
	get current() {return this.#curr}
	get last()    {return this.#last}
	get default() {return this.#default}

	/** @param {readonly State[]} states */
	init(states) {
		states?.forEach((/**@type {State}*/s,i)=> {
			const self = /**@type {any}*/(this)
			i == 0 && (this.#default = s)
			self[`to${s}`] = (/**@type {Def.Opts}*/opt)=> this.to(s,opt)
			defineProperty(this,`is${s}`, {get(){return this.#curr === s}})
			defineProperty(this,`was${s}`,{get(){return this.#last === s}})
		})
		return this
	}

	/** @param {State} state */
	is(state) {
		return this.#curr == state
	}

	/** @param {State} [state] */
	was(state) {
		return state === this.#last
	}

	/** @param {JQWindowHandlers} v */
	on(v) {
		for (const [ev,fn] of entries(v))
			$win.on(underscoreToSp(ev,String(this.default)), fn)
		return this
	}

	/** @param {JQTriggerHandler} handler */
	onChange(handler) {
		$(this.#eventBus).on('change', handler)
	}

	/**
	 @param {State} state
	 @param {{data?:JQData, delay?:number, fn?:(state:State,data?:JQData)=> void}} opts
	*/
	to(state, {data,delay=-1,fn}={}) {
		if (delay >= 0) {
			Timer.set(delay, ()=> this.to(state,{delay:-1,data}))
			return this
		}
		this.#last = this.current
		this.#curr = state
		fn?.(state,data)
		$(this.#eventBus).trigger('change')
		return this
	}
}

/**
@typedef {{
   new <Self,Owner,State extends string>(owner:Owner):
   StateBase<Owner,State> & Def.Props<Owner,State,Self>
}} StateBaseConstructor
*/ export default /**@type {StateBaseConstructor}*/(StateBase)
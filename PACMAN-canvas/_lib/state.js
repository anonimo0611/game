import {Timer} from './timer.js'
export default class {
	#state = ''
	#last  = ''
	init(state) {
		this.Enum = Object.create(null)
		for (const [key,val] of entries(this)) {
			const state = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (state) this.Enum[state] = state; else continue
			if (this.#state === '' && val === true) this.#state = state
			defineProperty(this, key, {get(){return this.#state === state}})
			this['switchTo'+state] = data=> this.switchTo(state, data)
		}
		freeze(this.Enum)
		hasOwn(this.Enum, state) && this.switchTo(state)
	}
	get last()    {return this.#last}
	get current() {return this.#state}
	lastIs(state) {return state === this.last}

	switchTo(state, {delay=-1,fn}={}) {
		if (!hasOwn(this.Enum, state))
			throw ReferenceError(`State '${state}' is not defined`)
		if (delay >= 0) {
			Timer.set(delay, ()=> this.switchTo(state,{fn}))
			return this
		}
		this.#last  = this.current
		this.#state = state
		isFun(fn) && fn(state)
		return this
	}
}
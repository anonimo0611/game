export class State {
	#state = '';
	#defaultState;
	#lastState;
	init() {
		this.Enum = Object.create(null)
		for (const [key, val] of entries(this)) {
			const state = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (state) this.Enum[state] = state; else continue
			if (this.#state === '' && val === true) this.#state = state
			defineProperty(this, key, {get(){return this.#state === state}})
			this['switchTo'+state] = data=> this.switchTo(state, data);
		}
		freeze(this.Enum)
		this.#lastState    = 
		this.#defaultState = this.current
	}
	get current()  {
		return String(this.#state)
	}
	get last()  {
		return this.#lastState;
	}
	some(stateStr){
		return String(stateStr).split('|').some(k=> k === this.#state)
	}
	switchTo(state) {
		if (!hasOwn(this.Enum, state))
			throw ReferenceError(`State '${state}' is not defined`)
		this.#lastState = this.current;
		return (this.#state = state);
	}
	reset() {
		this.switchTo(this.#defaultState)
	}
}
export class State {
	#state = '';
	init(state) {
		this.Enum = Object.create(null)
		for (const [key, val] of entries(this)) {
			const state = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (state) this.Enum[state] = state; else continue
			if (this.#state === '' && val === true) this.#state = state
			defineProperty(this, key, {get(){return this.#state === state}})
			this['switchTo'+state] = data=> this.switchTo(state, data);
		} freeze(this.Enum)
		this.Enum[state] && this.switchTo(state);
	}
	get current() {return String(this.#state)}
	some(keyStr)  {return splitByBar(keyStr).some(k=> k === this.#state)}
	switchTo(state) {
		if (!hasOwn(this.Enum, state))
			throw ReferenceError(`State '${state}' is not defined`)
		return (this.#state = state);
	}
}
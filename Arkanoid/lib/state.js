export class State {
	#state = '';
	init(state) {
		this.enum = Object.create(null)
		for (const [key, val] of entries(this)) {
			const state = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (state) this.enum[state] = state; else continue
			if (this.#state === '' && val === true) this.#state = state
			defineProperty(this, key, {get(){return this.#state === state}})
		} freeze(this.enum)
		this.enum[state] && this.switch(state);
	}
	get current() {return String(this.#state)}
	some(keyStr)  {return splitByBar(keyStr).some(k=> k === this.#state)}
	switch(state) {
		if (!this.enum[state])
			throw ReferenceError(`State '${state}' is not defined`)
		return (this.#state = state);
	}
}
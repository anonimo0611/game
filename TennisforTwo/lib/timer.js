const TimerMap = new Map()
export const Ticker = freeze(class {
	static #symbol  = Symbol()
	static #count   = 0
	static #ticker  = null
	static #paused  = false
	static Interval = 1000/60
	static get paused()  {return this.#paused}
	static get count()   {return this.#count}
	static get running() {return this.#ticker instanceof this}
	static pause(force)  {return this.#paused=!!(isBool(force)? force : !this.#paused)}
	static set(...args)  {new Ticker(this.#symbol, ...args)}
	static stop()        {this.#ticker?.stop();return this}
	static resetCount()  {this.#ticker?.resetCount();return this}
	constructor(symbol, fn=null) {
		if (symbol != Ticker.#symbol)
			throw TypeError('The constructor is not visible')
		Ticker.#ticker?.stop()
		Ticker.#ticker = this
		this.fn     = isFun(fn) ? fn : null
		this.start  = this.stopped = 0
		this.update = this.update.bind(this)
		requestAnimationFrame(this.update)
	}
	update(ts) {
		if (!this.stopped) requestAnimationFrame(this.update); else return
		if ((ts-(this.start||=ts))/Ticker.Interval > Ticker.count)
			!Ticker.paused && this.tick()
	}
	tick() {
		TimerMap.forEach(this.timer)
		this.fn?.(), Ticker.#count++
	}
	timer(t, id) {
		if (Timer.frozen && !t.ignoreFrozen)   return
		if (Ticker.Interval*t.amount++ < t.ms) return
		t.fn(), TimerMap.delete(id)
	}
	stop() {
		this.stopped   = 1
		Timer.frozen   = false;
		TimerMap.clear()
		Ticker.#ticker = null
		Ticker.#count  = 0
		Ticker.#paused = false
	}
	resetCount() {Ticker.#count = this.start = 0}
})
export const Timer = freeze(new class {
	#frozen = false
	get frozen()  {return this.#frozen}
	set frozen(b) {isBool(b) && (this.#frozen = b)}
	set(ms, fn, {id=null,ignoreFrozen=Timer.frozen}={}) {
		if (!isNum(ms)) throw TypeError(`'${ms}' is not a number`)
		if (!isFun(fn)) throw TypeError(`'${fn}' is not a function`)
		Ticker.running == false && Ticker.set()
		TimerMap.set(id ?? Symbol(), {ms,fn,ignoreFrozen,amount:0})
	}
	sequence(...seq) {
		(seq=seq.flatMap(s=>isArray(s)?{ms:s[0],fn:s[1]}:[])).forEach(s=> {
			if (!isNum(s.ms)) throw TypeError(`'${s.ms}' is not a number`)
			if (!isFun(s.fn)) throw TypeError(`'${s.fn}' is not a function`)
		});
		let idx=0, s=seq[idx]
		function fire() {
			seq[idx].fn()
			;(s=seq[++idx]) ? Timer.set(s.ms, fire) : fire=null
		} seq.length && Timer.set(s.ms, fire)
	}
	has(id)  {
		return TimerMap.has(id)
	}
	cancel(id)  {
		TimerMap.delete(id)
		return this;
	}
	cancelAll() {
		Timer.frozen = false;
		TimerMap.clear()
		return this;
	}
})
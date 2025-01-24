const ModSymbol = Symbol()
const TimerMap  = new Map()

/** @type {?Ticker} */
let _ticker  = null
let _paused  = false
let _counter = 0
let _pausedCounter = 0

export const Ticker = freeze(class {
	static Interval = 1000/60
	static get paused()      {return _paused}
	static get count()       {return _counter}
	static get elapsedTime() {return _counter*this.Interval}
	static get pausedCount() {return _pausedCounter}
	static get running()     {return _ticker instanceof this}

	/** @param {...function|undefined} args */
	static set(...args) {new Ticker(ModSymbol, ...args)}
	/** @param {boolean|undefined} force */
	static pause(force) {return _paused=!!(isBool(force)? force : !_paused)}
	static stop()       {this.running && _ticker.stop();return this}
	static resetCount() {this.running && _ticker.resetCount()}

	constructor(symbol, fn=null, pausingFn=null) {
		if (symbol != ModSymbol)
			throw TypeError('The constructor is not visible')
		Ticker.running && _ticker.stop()
		_ticker    = this
		this.start = this.count = this.stopped = 0
		this.loop  = this.loop.bind(this)
		this.fn    = isFun(fn)? fn : null
		this.pFn   = isFun(pausingFn)? pausingFn : null
		requestAnimationFrame(this.loop)
	}
	loop(ts) {
		if (this.stopped) return
		requestAnimationFrame(this.loop)
		if ((ts-(this.start||=ts))/Ticker.Interval > this.count)
			this.tick()
	}
	tick() {
		if (!_paused) {
			TimerMap.forEach(this.timer)
			this.fn?.()
			_pausedCounter = 0
			_counter++
		} else {
			this.pFn?.()
			_pausedCounter++
		}
		this.count++
	}
	timer(t, key) {
		if (Timer.frozen && !t.ignoreFrozen)   return
		if (Ticker.Interval*t.amount++ < t.ms) return
		TimerMap.delete(key)
		t.fn()
	}
	stop() {
		TimerMap.clear()
		Timer.unfreeze()
		this.stopped = 1
		_ticker  = null
		_paused  = false
		_counter = _pausedCounter = 0
	}
	resetCount() {
		_counter = 0
	}
})
export const Timer = freeze(new class {
	#frozen = false
	get frozen() {return this.#frozen}
	freeze()     {this.#frozen = true; return this}
	unfreeze()   {this.#frozen = false;return this}
	set(ms=0, fn=()=>{}, {key,ignoreFrozen=Timer.frozen}={}) {
		if (!isNum(ms)) throw TypeError(`'${ms}' is not a number`)
		if (!isFun(fn)) throw TypeError(`'${fn}' is not a function`)
		if (!Ticker.running) Ticker.set();
		TimerMap.set(key ?? Symbol(), {ms,fn,ignoreFrozen,amount:0})
	}
	/** @param {...[timeout:number, handler:function]} seq */
	sequence(...seq) {
		(seq=seq.flatMap(s=> isArray(s)?{ms:s[0],fn:s[1]}:[])).forEach(s=> {
			if (!isNum(s.ms)) throw TypeError(`'${s.ms}' is not a number`)
			if (!isFun(s.fn)) throw TypeError(`'${s.fn}' is not a function`)
		})
		let idx=0, s=seq[idx]
		function fire() {
			seq[idx].fn()
			;(s=seq[++idx]) ? Timer.set(s.ms, fire) : (fire=null)
		} seq.length && Timer.set(s.ms, fire)
	}
	stop()      {Ticker.stop(); return this}
	cancelAll() {TimerMap.clear(); return this}
	cancel(key) {TimerMap.delete(key); return this}
})
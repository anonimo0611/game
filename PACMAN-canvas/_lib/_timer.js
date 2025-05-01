'use strict'
const {Ticker,Timer}= function() {

/** @typedef {{ms:number, fn:Function, ignoreFrozen:boolean, amount:number}} TimerData */
/** @type {Map<any, TimerData>} */
const TimerMap = new Map()

/** @type {?Tick} */
let _ticker  = null
let _paused  = false
let _counter = 0
let _pausedCounter = 0

const Ticker = freeze(new class {
	Interval = 1000/60
	get paused()      {return _paused}
	get count()       {return _counter}
	get running()     {return _ticker instanceof Tick}
	get elapsedTime() {return _counter*this.Interval}
	get pausedCount() {return _pausedCounter}

	/**
	 * @param {Function} [handler]
	 * @param {Function} [pausedHandler]
	 */
	set(handler, pausedHandler) {
		new Tick(handler, pausedHandler)
	}

	/** @param {boolean} [force] */
	pause(force) {return _paused=!!(isBool(force)? force : !_paused)}

	stop()       {this.running && _ticker.stop();return this}
	resetCount() {this.running && _ticker.resetCount()}
})

class Tick {
	constructor(fn=null, pausingFn=null) {
		Ticker.running && _ticker.stop()
		_ticker    = this
		this.start = this.count = this.stopped = 0
		this.loop  = this.loop.bind(this)
		this.fn    = isFun(fn)? fn : null
		this.pFn   = isFun(pausingFn)? pausingFn : null
		requestAnimationFrame(this.loop)
	}
	/** @param {number} ts */
	loop(ts) {
		if (this.stopped)
			return
		if ((ts-(this.start||=ts))/Ticker.Interval > this.count)
			this.tick()
		requestAnimationFrame(this.loop)
	}
	tick() {
		this.count++
		if (_paused) {
			this.pFn?.()
			_pausedCounter++
			return
		}
		TimerMap.forEach(this.timer)
		this.fn?.()
		_counter++
		_pausedCounter = 0
	}
	/** @param {TimerData} t */
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
}
const Timer = freeze(new class {
	#frozen = false
	get frozen() {return this.#frozen}
	freeze()   {this.#frozen = true; return this}
	unfreeze() {this.#frozen = false;return this}

	/**
	 * @param {number} ms
	 * @param {Function} fn
	 */
	set(ms, fn, {key,ignoreFrozen=Timer.frozen}={}) {
		if (!isNum(ms)) throw TypeError(`'${ms}' is not a number`)
		if (!isFun(fn)) throw TypeError(`'${fn}' is not a function`)
		if (!Ticker.running) Ticker.set();
		TimerMap.set(key ?? Symbol(), {ms,fn,ignoreFrozen,amount:0})
	}

	/** @param {...[timeout:number, handler:Function]} sequence */
	sequence(...sequence) {
		if (!sequence.length)
			return
		const
		seq = sequence.map(s=> ({ms:s[0],fn:s[1]}))
		seq.forEach(s=> {
			if (!isNum(s.ms)) throw TypeError(`'${s.ms}' is not a number`)
			if (!isFun(s.fn)) throw TypeError(`'${s.fn}' is not a function`)
		})
		let idx=0, s=seq[idx]
		function fire() {
			seq[idx].fn()
			;(s=seq[++idx]) ? Timer.set(s.ms, fire) : (fire=null)
		} Timer.set(s.ms, fire)
	}
	stop()      {Ticker.stop();     return this}
	cancel(k)   {TimerMap.delete(k);return this}
	cancelAll() {TimerMap.clear();  return this}
})
return {Ticker,Timer}

}()
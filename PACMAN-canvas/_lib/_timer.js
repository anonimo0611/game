'use strict'
/** @typedef {[timeout:number,handler:Function]} TimerSequenceItem */
/** @typedef {{timeout:number,handler:Function,ignoreFrozen:boolean,amount:number}} TimerData */

const {Ticker,Timer}= function() {

const TimerMap = /**@type {Map<any,TimerData>}*/(new Map)
const Interval = 1000/60

let _ticker = /**@type {?Tick}*/(null)
let _paused = false

let _counter  = 0 // frame count
let _pCounter = 0 // for paused

const Ticker = freeze(new class {
	Interval = Interval
	get paused()      {return _paused}
	get count()       {return _counter}
	get running()     {return _ticker instanceof Tick}
	get elapsedTime() {return _counter*Interval}
	get pausedCount() {return _pCounter}

	/**
	 * @param {Function} [handler]
	 * @param {Function} [pausedHandler]
	 */
	set(handler, pausedHandler) {
		new Tick(handler, pausedHandler)
	}

	/** @param {boolean} [force] */
	pause(force) {return _paused=!!(isBool(force)? force : !_paused)}

	stop()       {this.running && _ticker?.stop();return this}
	resetCount() {this.running && _ticker?.resetCount()}
})

class Tick {
	/**
	 * @param {Function} [fn]
	 * @param {Function} [pausingFn]
	 */
	constructor(fn, pausingFn) {
		Ticker.running && _ticker?.stop()
		_ticker    = this
		this.start = this.count = this.stopped = 0
		this.loop  = this.loop.bind(this)
		this.fn    = fn
		this.pFn   = pausingFn
		requestAnimationFrame(this.loop)
	}
	/** @param {number} ts */
	loop(ts) {
		if (this.stopped)
			return
		requestAnimationFrame(this.loop)
		if ((ts-(this.start||=ts))/Interval >= this.count)
			this.tick()
	}
	tick() {
		this.count++
		if (_paused) {
			this.pFn?.()
			_pCounter++
			return
		}
		TimerMap.forEach(this.timer)
		this.fn?.()
		_counter++
		_pCounter = 0
	}
	/**
	 * @param {TimerData} t
	 * @param {unknown} key
	 */
	timer(t, key) {
		if (Timer.frozen && !t.ignoreFrozen)
			return
		if (Interval*t.amount++ < t.timeout)
			return
		TimerMap.delete(key)
		t.handler()
	}
	stop() {
		TimerMap.clear()
		Timer.unfreeze()
		this.stopped = 1
		_ticker  = null
		_paused  = false
		_counter = _pCounter = 0
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
	 * @param {number}   timeout
	 * @param {Function} handler
	 * @param {{key?:unknown,ignoreFrozen?:boolean}} config
	 */
	set(timeout, handler, {key,ignoreFrozen=Timer.frozen}={}) {
		!Ticker.running && Ticker.set()
		TimerMap.set(key ?? Symbol(), {timeout,handler,ignoreFrozen,amount:0})
	}

	/** @param {...TimerSequenceItem} sequence */
	sequence(...sequence) {
		if (!sequence.length)
			return
		const seq = sequence.map(s=> ({ms:s[0],fn:s[1]}))
		let idx=0, s=seq[idx]
		function fire() {
			seq[idx].fn()
			;(s=seq[++idx]) && Timer.set(s.ms, fire)
		} Timer.set(s.ms, fire)
	}
	cancel(/**@type {unknown}*/key) {
		TimerMap.delete(key)
		return this
	}
	cancelAll() {
		TimerMap.clear()
		return this
	}
	stop() {
		Ticker.stop()
		return this
	}
})
return {Ticker,Timer}

}()
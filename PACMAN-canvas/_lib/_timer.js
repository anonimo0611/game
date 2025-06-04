'use strict'
/** @typedef {[timeout:number,handler:Function]} TimerSequenceItem */
/** @typedef {{timeout:number,handler:Function,ignoreFrozen:boolean,amount:number}} TimerData */

const {Ticker,Timer} = function() {
	const Interval = 1000/60
	const TimerMap = /**@type {Map<any,TimerData>}*/(new Map)
	let _ticker    = /**@type {?Tick}*/(null)
	let _paused    = false
	let _fCounter  = 0 //frame  count
	let _pCounter  = 0 //paused count

	const Ticker = freeze(new class {
		Interval = Interval
		get paused()      {return _paused}
		get count()       {return _fCounter}
		get running()     {return _ticker instanceof Tick}
		get elapsedTime() {return _fCounter * Interval}
		get pausedCount() {return _pCounter}

		/**
		 * @param {Function} [handler]
		 * @param {Function} [pausedHandler]
		 */
		set(handler,pausedHandler) {new Tick(handler,pausedHandler)}

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
			_ticker?.stop()
			_ticker    = this
			this.start = this.count = this.stopped = 0
			this.loop  = this.loop.bind(this)
			this.fn    = fn
			this.pFn   = pausingFn
			requestAnimationFrame(this.loop)
		}
		loop(/**@type {number}*/ts) {
			if (this.stopped) return; requestAnimationFrame(this.loop)
			if ((ts-(this.start||=ts))/Interval>=this.count)this.tick()
		}
		tick() {
			!_paused
				? this.proc()
				: this.pausedProc()
			this.count++
		}
		proc() {
			TimerMap.forEach(this.timer)
			this.fn?.()
			_pCounter = 0
			_fCounter++
		}
		pausedProc() {
			this.pFn?.()
			_pCounter++

		}
		timer(
		 /**@type {TimerData}*/t,
		 /**@type {unknown}*/key
		) {
			if (Timer.frozen && !t.ignoreFrozen) return
			if (Interval*t.amount++ < t.timeout) return
			TimerMap.delete(key);t.handler()
		}
		stop() {
			TimerMap.clear()
			Timer.unfreeze()
			this.stopped = 1
			_ticker   = null
			_paused   = false
			_fCounter = _pCounter = 0
		}
		resetCount() {_fCounter = 0}
	}
	const Timer = freeze(new class {
		#frozen = false
		get frozen(){return this.#frozen}
		freeze()    {this.#frozen = true; return this}
		unfreeze()  {this.#frozen = false;return this}
		/**
		 * @param {number}   timeout
		 * @param {Function} handler
		 * @param {{key?:unknown,ignoreFrozen?:boolean}} config
		 */
		set(timeout, handler, {key,ignoreFrozen=Timer.frozen}={}) {
			!Ticker.running && Ticker.set()
			TimerMap.set(key??Symbol(),{timeout,handler,ignoreFrozen,amount:0})
		}
		/** @param {...readonly [...TimerSequenceItem]} sequence */
		sequence(...sequence) {
			if (!sequence.length) return
			const seq=sequence.map(s=>({ms:s[0],fn:s[1]}));let idx=0,s=seq[idx]
			function fire(){seq[idx].fn();(s=seq[++idx])&&Timer.set(s.ms,fire)}
			Timer.set(s.ms,fire)
		}
		stop() {Ticker.stop();return this}
		/** @param {unknown} key */
		cancel(key) {TimerMap.delete(key);return this}
		cancelAll() {TimerMap.clear();return this}
	})
	return {Ticker,Timer}
}()
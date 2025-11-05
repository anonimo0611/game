'use strict'
const {Ticker,Timer} = function() {
	/**
	@typedef {{
		amount:  number;
		timeout: number;
		handler: Function;
		ignoreFrozen: boolean;
	}} TimerData
	*/
	const Interval = 1000/60
	const TimerMap = /**@type {Map<any,TimerData>}*/(new Map)
	let _ticker    = /**@type {?Tick}*/(null)
	let _paused    = false
	let _fCounter  = 0 // frame  count
	let _pCounter  = 0 // paused count

	const Ticker = freeze(new class {
		Interval = Interval
		get paused()      {return _paused}
		get count()       {return _fCounter}
		get running()     {return _ticker instanceof Tick}
		get elapsedTime() {return _fCounter * Interval}
		get pausedCount() {return _pCounter}

		/**
		 * @param {Function} [updateFn]
		 * @param {Function} [drawFn]
		 */
		set(updateFn,drawFn) {new Tick(updateFn,drawFn)}

		/** @param {boolean} [force] */
		pause(force) {return _paused=!!(force? force : !_paused)}
		stop()       {this.running && _ticker?.stop();return this}
		resetCount() {this.running && _ticker?.resetCount()}
	})
	class Tick {
		/**
		 * @param {Function} [update]
		 * @param {Function} [drawFn]
		 */
		constructor(update, drawFn) {
			_ticker?.stop()
			_ticker     = this
			this.start  = this.count = this.stopped = 0
			this.loop   = this.loop.bind(this)
			this.update = update
			this.draw   = drawFn
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
			this.update?.()
			this.draw?.()
			_pCounter = 0
			_fCounter++
		}
		pausedProc() {
			this.draw?.()
			_pCounter++
		}
		timer(
		 /**@type {TimerData}*/t,
		 /**@type {unknown}*/  key
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
			TimerMap.set(key??Symbol(),{amount:0,timeout,handler,ignoreFrozen})
		}
		/** @param {...{ms:number,fn:Function}} seq */
		sequence(...seq) {
			let idx=0, s=seq[idx]
			function fire() {
				seq[idx].fn()
				;(s=seq[++idx]) && Timer.set(s.ms, fire)
			}
			Timer.set(s.ms, fire)
		}
		stop() {Ticker.stop();return this}
		/** @param {unknown} key */
		cancel(key) {TimerMap.delete(key);return this}
		cancelAll() {TimerMap.clear();return this}
	})
	return {Ticker,Timer}
}()
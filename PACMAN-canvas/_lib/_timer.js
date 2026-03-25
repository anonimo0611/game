'use strict'
const {Ticker,Timer}= function() {
	/**
	@typedef {{
		amount:  number;
		timeout: number;
		handler: Function;
		ignoreFrozen: boolean;
	}} TimerData
	*/
	const TICK_STEP = 1000/60
	const THRESHOLD = 100

	/** @type {Map<any,TimerData>} */
	const TimerMap = new Map

	let _ticker = /**@type {?TickerCore}*/(null)
	let _paused = false
	let _fCount = 0 // frame  count
	let _pCount = 0 // paused count

	const Ticker = new class {
		get Interval()    {return TICK_STEP}
		get count()       {return _fCount}
		get pausedCount() {return _pCount}
		get paused()      {return _paused}
		get running()     {return _ticker instanceof TickerCore}
		get elapsedTime() {return _fCount*TICK_STEP}

		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		set(updateFn,drawFn) {
			new TickerCore(updateFn,drawFn)
		}
		/** @param {boolean} [force] */
		pause(force) {
			return _paused = !!(force? force : !_paused)
		}
		resetCount() {
			_fCount = 0
			if (_ticker) _ticker.needsReset = true
		}
		stop()  {
			_ticker?.stop()
		}
		reset() {
			_fCount =
			_pCount = 0
			_paused = false
			TimerMap.clear()
			Timer.unfreeze()
		}
	}

	class TickerCore {
		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		constructor(updateFn, drawFn) {
			_ticker?.stop()
			_ticker     = this
			this.acc    = 0
			this.lstTS  = 0
			this.update = updateFn
			this.draw   = drawFn
			this.rAFId  = requestAnimationFrame(this.loop)
			this.needsReset = false
		}
		/** @param {number} ts */
		loop = (ts) => {
			this.rAFId = requestAnimationFrame(this.loop)

			if (this.lstTS === 0)
				this.lstTS = ts
			let dt = ts - this.lstTS
			if (dt > THRESHOLD)
				dt = TICK_STEP

			this.acc += dt
			this.lstTS = ts

			if (this.needsReset) {
				this.needsReset = false
				this.acc = TICK_STEP
			}
			while(ceil(this.acc) >= TICK_STEP) {
				this.acc -= TICK_STEP
				this.tick()
			}
			this.draw?.()
		}
		tick() {
			_paused
				? this.updatePausing()
				: this.updateGame()
		}
		updatePausing() {
			_pCount++
		}
		updateGame() {
			TimerMap.forEach(this.timer)
			this.update?.()
			_pCount = 0
			_fCount++
		}
		/**
		 @param {TimerData} t
		 @param {unknown} key
		*/
		timer(t, key) {
			if (Timer.frozen && !t.ignoreFrozen)  return
			if (TICK_STEP*t.amount++ < t.timeout) return
			TimerMap.delete(key);t.handler()
		}
		stop()  {
			Ticker.reset()
			_ticker = null
			cancelAnimationFrame(this.rAFId)
		}
	}

	const Timer = new class {
		#frozen = false
		get frozen() {return this.#frozen}
		freeze()   {this.#frozen = true; return this}
		unfreeze() {this.#frozen = false;return this}
		/**
		 @param {number}    timeout
		 @param {()=> void} handler
		 @param {{key?:unknown,ignoreFrozen?:boolean}} otps
		*/
		set(timeout, handler, {key,ignoreFrozen=Timer.frozen}={}) {
			if (!Ticker.running) Ticker.set()
			TimerMap.set(key ?? Symbol(),{amount:0,timeout,handler,ignoreFrozen})
		}
		/** @param {{ms:number,fn():void}[]} seq */
		sequence(...seq) {
			let idx=0, s=seq[idx]
			function fire() {
				seq[idx].fn()
				;(s=seq[++idx]) && Timer.set(s.ms, fire)
			}
			Timer.set(s.ms, fire)
		}
		/** @param {unknown} key */
		cancel(key) {
			TimerMap.delete(key)
			return this
		}
		cancelAll() {
			TimerMap.clear()
			return this
		}
	}

	return {Ticker,Timer}
}()


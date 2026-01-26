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
	const FPS      = 60
	const Interval = 1000/FPS
	const TimerMap = /**@type {Map<any,TimerData>}*/(new Map)

	let _ticker = /**@type {?Tick}*/(null)
	let _paused = false
	let _fCount = 0 // frame  count
	let _pCount = 0 // paused count

	const Ticker = freeze(new class {
		Interval = Interval
		get count()       {return _fCount}
		get pausedCount() {return _pCount}
		get paused()      {return _paused}
		get running()     {return _ticker instanceof Tick}
		get elapsedTime() {return _fCount*Interval}

		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		set(updateFn,drawFn) {
			new Tick(updateFn,drawFn)
		}
		/** @param {boolean} [force] */
		pause(force) {
			return _paused = !!(force? force : !_paused)
		}
		resetCount() {
			_fCount = 0
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
	})

	class Tick {
		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		constructor(updateFn, drawFn) {
			_ticker?.stop()
			_ticker     = this
			this.acc    = 0
			this.start  = 0
			this.lastTS = 0
			this.update = updateFn
			this.draw   = drawFn
			this.loop   = this.loop.bind(this)
			this.rAFId  = requestAnimationFrame(this.loop)
		}
		/** @param {number} ts */
		loop(ts) {
			this.rAFId = requestAnimationFrame(this.loop)
			if (this.lastTS === 0)
				this.lastTS = this.acc = ts
			const delta = ts - this.lastTS
			this.lastTS = ts
			this.acc += delta
			if (this.acc >= Interval) {
				this.acc -= Interval
				this.tick()
			}
			this.draw?.()
		}
		tick() {
			_paused
				? _pCount++
				: this.updateGame()
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
			if (Timer.frozen && !t.ignoreFrozen) return
			if (Interval*t.amount++ < t.timeout) return
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
		get frozen() {
			return this.#frozen
		}
		freeze()   {this.#frozen = true; return this}
		unfreeze() {this.#frozen = false;return this}
		/**
		 @param {number}    timeout
		 @param {()=> void} handler
		 @param {{key?:unknown,ignoreFrozen?:boolean}} config
		*/
		set(timeout, handler, {key,ignoreFrozen=Timer.frozen}={}) {
			if (!Ticker.running) Ticker.set()
			TimerMap.set(key ?? Symbol(),{amount:0,timeout,handler,ignoreFrozen})
		}
		/** @param {...{ms:number,fn:()=> void}} seq */
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
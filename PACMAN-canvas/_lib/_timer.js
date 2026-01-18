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
	const FPS      = 60
	const Interval = 1000/FPS
	const TimerMap = /**@type {Map<any,TimerData>}*/(new Map)

	let _fCounter  = 0 // frame  count
	let _pCounter  = 0 // paused count
	let _paused    = false
	let _ticker    = /**@type {?Tick}*/(null)

	const Ticker = freeze(new class {
		Interval = Interval
		get paused()      {return _paused}
		get running()     {return _ticker instanceof Tick}
		get count()       {return _fCounter}
		get elapsedTime() {return _fCounter * Interval}
		get pausedCount() {return _pCounter}

		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		set(updateFn,drawFn) {new Tick(updateFn,drawFn)}

		/**
		 @param {boolean} [force]
		*/
		pause(force) {return _paused=!!(force? force : !_paused)}

		stop()       {this.running && _ticker?.stop();return this}
		resetCount() {this.running && _ticker?.resetCount()}
	})

	class Tick {
		/**
		 @param {()=> void} [updateFn]
		 @param {()=> void} [drawFn]
		*/
		constructor(updateFn, drawFn) {
			_ticker?.stop()
			_ticker      = this
			this.acc     = 0
			this.start   = 0
			this.lastTS  = 0
			this.stopped = false
			this.loop    = this.loop.bind(this)
			this.update  = updateFn
			this.draw    = drawFn
			requestAnimationFrame(this.loop)
		}
		/**
		 @param {number} ts
		*/
		loop(ts) {
			if (this.stopped) return
			requestAnimationFrame(this.loop)
			if (this.lastTS === 0)
				this.lastTS = this.acc = ts
			const delta = ts - this.lastTS
			this.lastTS = ts
			this.acc += delta
			if (this.acc >= Interval) {
				this.tick()
				this.acc %= Interval
			}
			this.draw?.()
		}
		tick() {
			if (_paused) {
				_pCounter++
				return
			}
			this.updateGame()
		}
		updateGame() {
			TimerMap.forEach(this.timer)
			this.update?.()
			_pCounter = 0
			_fCounter++
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
		stop() {
			TimerMap.clear()
			Timer.unfreeze()
			this.stopped = true
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
		 @param {number}    timeout
		 @param {()=> void} handler
		 @param {{key?:unknown,ignoreFrozen?:boolean}} config
		*/
		set(timeout, handler, {key,ignoreFrozen=Timer.frozen}={}) {
			!Ticker.running && Ticker.set()
			TimerMap.set(key??Symbol(),{amount:0,timeout,handler,ignoreFrozen})
		}
		/**
		 @param {...{ms:number,fn:()=> void}} seq
		*/
		sequence(...seq) {
			let idx=0, s=seq[idx]
			function fire() {
				seq[idx].fn()
				;(s=seq[++idx]) && Timer.set(s.ms, fire)
			}
			Timer.set(s.ms, fire)
		}
		stop() {
			Ticker.stop()
			return this
		}
		cancel(/**@type {unknown}*/key) {
			TimerMap.delete(key)
			return this
		}
		cancelAll() {
			TimerMap.clear()
			return this
		}
	})
	return {Ticker,Timer}
}()
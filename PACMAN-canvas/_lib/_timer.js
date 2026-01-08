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
		get delta()       {return (this.deltaMs/Interval) || 0}
		get deltaMs()     {return _ticker?.dtMs  ?? 0}
		get deltaSec()    {return _ticker?.dtSec ?? 0}
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
			this.count   = 0
			this.start   = 0
			this.lastTS  = 0
			this.dtMs    = 0
			this.dtSec   = 0
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
			if (this.lastTS == 0) {
				this.lastTS = this.start = ts
			}
			requestAnimationFrame(this.loop)
			this.dtMs  = ts - this.lastTS
			this.dtSec = this.dtMs/1000
			if ((ts-this.start)/Interval > this.count)
				this.tick()
			this.lastTS = ts
			this.draw?.()
		}
		tick() {
			!_paused
				? this.updateGame()
				: _pCounter++
			this.count++
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
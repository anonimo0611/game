'use strict'
const {Ticker,Timer}= function() {
//-- begin --

const TICK_STEP = 1000/60
const THRESHOLD = 250

/** @type {Map<any,TimerData>} */
const TimerMap = new Map()

let _ticker  = /**@type {?TickerCore}*/(null)
let _fCount  = 0 // frame  count
let _pCount  = 0 // paused count
let _paused  = false
let _tFrozen = false

const Ticker = {
	get Interval()    {return TICK_STEP},
	get count()       {return _fCount},
	get pausedCount() {return _pCount},
	get paused()      {return _paused},
	get running()     {return _ticker instanceof TickerCore},
	get elapsedTime() {return _fCount*TICK_STEP},

	/** @param {Scene} [s] */
	set(s) {new TickerCore(s?.update, s?.draw)},

	/** @param {boolean} [force] */
	pause(force) {
		return _paused = !!(force? force : !_paused)
	},
	stop()  {
		_ticker?.stop()
	},
	resetCount() {
		_fCount = 0
		if (_ticker)
			_ticker.needsReset = true
	},
	reset() {
		_fCount  = 0
		_pCount  = 0
		_paused  = false
		_tFrozen = false
		TimerMap.clear()
	}
}

class TickerCore {
	/**
	 @param {()=> void} [update]
	 @param {()=> void} [draw]
	*/
	constructor(update,draw) {
		_ticker?.stop()
		_ticker     = this
		this.acc    = 0
		this.lstTS  = 0
		this.update = update
		this.draw   = draw
		this.rAFId  = requestAnimationFrame(this.loop)
		this.needsReset = false
	}
	loop = (/**@type {number}*/ts)=> {
		this.rAFId = requestAnimationFrame(this.loop)

		if (this.lstTS === 0)
			this.lstTS = ts
		let dt = ts - this.lstTS
		if (dt > THRESHOLD)
			dt = THRESHOLD

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
	timer(
	 /**@type {TimerData}*/t,
	 /**@type {unknown}*/key
	) {
		if (Timer.frozen && !t.ignoreFrozen)  return
		if (TICK_STEP*t.amount++ < t.timeout) return
		TimerMap.delete(key), t.callback()
	}
	stop()  {
		Ticker.reset()
		_ticker = null
		cancelAnimationFrame(this.rAFId)
	}
}

const Timer = {
	get frozen() {return _tFrozen},
	freeze()   {_tFrozen = true; return this},
	unfreeze() {_tFrozen = false;return this},
	/**
	 @param {number}    timeout
	 @param {()=> void} callback
	 @param {{key?:unknown,ignoreFrozen?:boolean}} otps
	*/
	set(timeout, callback, {key,ignoreFrozen=false}={}) {
		if (!Ticker.running) Ticker.set()
		TimerMap.set(key ?? Symbol(), {amount:0,timeout,ignoreFrozen,callback})
	},
	cancelAll() {
		TimerMap.clear()
		return this
	},
	cancel(
	 /**@type {unknown}*/key
	) {
		TimerMap.delete(key)
		return this
	},
	sequence(
	 /**@type {TimerSeq[]}*/...seq
	) {
		if (seq.length == 0) return
		let idx = 0
		;(function processNext() {
			const [dur,cb,key]= seq[idx]
			Timer.set(dur, ()=> {
				cb(), idx++
				if (idx < seq.length)
					processNext()
			}, {key})
		})()
	},
}
return {Ticker,Timer}

//-- end --
}()
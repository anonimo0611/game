const {Ticker,Timer}= function() {

const TimerMap = new Map()
/** @type {?Ticker} */
let _ticker  = null
let _paused  = false
let _counter = 0
let _pausedCounter = 0

const Util = freeze(new class {
	Interval = 1000/60
	get paused()      {return _paused}
	get count()       {return _counter}
	get elapsedTime() {return _counter*this.Interval}
	get pausedCount() {return _pausedCounter}
	get running()     {return _ticker instanceof Ticker}

	/** @param {...function|undefined} args */
	set(...args) {new Ticker(...args)}
	/** @param {boolean|undefined} force */
	pause(force) {return _paused=!!(isBool(force)? force : !_paused)}
	stop()       {this.running && _ticker.stop();return this}
	resetCount() {this.running && _ticker.resetCount()}
})
class Ticker {
	constructor(fn=null, pausingFn=null) {
		Util.running && _ticker.stop()
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
		if ((ts-(this.start||=ts))/Util.Interval > this.count)
			this.tick()
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
		_pausedCounter = 0
		_counter++
	}
	timer(t, key) {
		if (Timer.frozen && !t.ignoreFrozen)   return
		if (Util.Interval*t.amount++ < t.ms) return
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
	freeze()     {this.#frozen = true; return this}
	unfreeze()   {this.#frozen = false;return this}
	set(ms=0, fn=()=>{}, {key,ignoreFrozen=Timer.frozen}={}) {
		if (!isNum(ms)) throw TypeError(`'${ms}' is not a number`)
		if (!isFun(fn)) throw TypeError(`'${fn}' is not a function`)
		if (!Util.running) Util.set();
		TimerMap.set(key ?? Symbol(), {ms,fn,ignoreFrozen,amount:0})
	}
	/** @param {...[timeout:number, handler:function]} sequence */
	sequence(...sequence) {
		if (!sequence.length) return
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
	stop()      {Util.stop(); return this}
	cancelAll() {TimerMap.clear(); return this}
	cancel(key) {TimerMap.delete(key); return this}
})
return {Ticker:Util,Timer}

}()

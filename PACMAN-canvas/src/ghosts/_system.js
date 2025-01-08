import {Sound}   from '../../_snd/sound.js'
import {Ticker}  from '../../_lib/timer.js'
import {Timer}   from '../../_lib/timer.js'
import StateBase from '../../_lib/state.js'
import {GhsStep} from '../_constants.js'
import {GhsType} from '../_constants.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Ctrl}    from '../control.js'
import {Pacman}  from '../pacman/pac.js'
import {Maze}    from '../maze.js'
import {Ghost}   from './ghost.js'
import {TileSize as T} from '../_constants.js'

const inFrontOfPac = g=> !behindThePac(g)
const behindThePac = g=> g.frightened

/** @type {Ghost[]} */
export const Ghosts   = []
export const SysMap   = new Map()
export const Step     = GhsStep
export const WaveType = freeze({Scatter:0,Chase:1})

/** @param {number} idx */
export const releaseTime = idx=> ([ // For always chase mode (ms)
	// Pinky->Aosuke->Guzuta
	[1000,  500,  500], // <-After life is lost
	[1000, 4000, 4000], [800, 2200, 4000], [600, 1900, 3500],
	[ 600, 1900, 1500], [500, 1300, 1200], [500, 1300, 1200],
	[ 300,  700,  800], [300,  700,  800], [200,  800,  200],
	[ 200,  800,  200], [100,  700,  200], [100,  700,  200],
	[   0,  900,    0]][Game.restarted? 0 : Game.clampedLv][idx])

export class GhostState extends StateBase {
	isIdle   = true
	isGoOut  = false
	isWalk   = false
	isBitten = false
	isEscape = false
	isReturn = false
	constructor(isInHouse) {
		super()
		this.init(isInHouse? 'Idle':'GoOut')
	}
	get isEscaping() {
		return this.isEscape || this.isReturn
	}
}

export const GhostMgr = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('Title Respawn',GhostMgr.#reset)
		$on('Playing',      GhostMgr.#onPlaying)
		$on('DotEaten',     GhostMgr.#dotEaten)
		$on('Clear Losing', GhostMgr.#setFadeOut)
	}
	#aidx = 0
	get aInterval() {return 6}
	get animIndex() {return this.#aidx}
	#reset() {
		GhostMgr.#aidx = 0
		SysMap.clear()
	}
	#onPlaying() {
		Sound.playSiren()
		Ctrl.isChaseMode && Timer.sequence(...Ghosts.slice(1).map((g,i)=>
			[releaseTime(i)/Game.speedRate, ()=> g.release()]))
	}
	#dotEaten(_, isPow) {
		if (!isPow) return
		Wave.setReversalSig()
		FrightMode.time && new FrightMode
	}
	#setFadeOut() {
		Ghosts.forEach(g=> g.sprite.setFadeOut())
	}
	update() {
		if (State.isPlaying
		 || State.isAttract
		 || State.isCBreak)
			this.#aidx ^= !Timer.frozen && !(Ticker.count % this.aInterval)
		SysMap.forEach(s=> s.update())
		Ghosts.forEach(g=> g.update())
		Ghosts.forEach(g=> this.crashWithPac(g))
	}
	crashWithPac(g, pacPos=Pacman.pos, {fn,radius}={}) {
		if (!(g instanceof Ghost) || !g.state.isWalk) return
		radius ??= (g.frightened? T/2 : T/3)
		collisionCircle(g, pacPos, radius) && g.crashWithPac(fn)
	}
	#draw = (_,i,array)=> array.at(-1-i).draw()
	drawFront()  {Ghosts.filter(inFrontOfPac).forEach(this.#draw)}
	drawBehind() {Ghosts.filter(behindThePac).forEach(this.#draw)}
}

export const Wave = new class {
	static {$on('Playing', ()=> Wave.#reset())}
	#mode = WaveType.Scatter
	get isChase()   {return this.#mode == WaveType.Chase}
	get isScatter() {return this.#mode == WaveType.Scatter}
	#reset() {
		const lv = Game.level
		const timeTbl = [ // ms
			lv <= 4 ? 4500 : 4000,
			15e3,
			lv <= 4 ? 4500 : 4000,
			15e3,
			3500,
			lv == 1 ? 15e3 : 78e4,
			lv == 1 ? 3500 :(1e3/60),
			Infinity,
		]
		let [time, idx] = [-1, 0]
		function update() {
			const duration = timeTbl[idx]/Game.speedRate
			if (Ghost.frightened
			 || Timer.frozen
			 || Ticker.Interval * ++time < duration
			) return
			[time, Wave.#mode] = [0, (++idx % 2)]
			Wave.setReversalSig()
		}
		Wave.#mode = int(Ctrl.isChaseMode)
		Wave.#mode == WaveType.Scatter && SysMap.set(Wave, {update})
	}
	setReversalSig() {
		Ghosts.forEach(g=> {
			$(g).trigger('Reverse')
			FrightMode.time == 0 && $(g).trigger('Runaway')
		})
	}
}

export const DotCounter = (function() {
	$on('DotEaten',   addCnt)
	$on('Title Ready',reset)
	let globalDotCnt = -1
	const counters = new Uint8Array(GhsType.Max)
	const limitTbl = [[7, 0,0,0],[17, 30,0,0],[32, 60,50,0]]
	function reset() {
		!Game.restarted && counters.fill(0)
		globalDotCnt = Game.restarted? 0 : -1
	}
	function release(idx, fn) {
		const timeOut = (Game.level <= 4 ? 4e3:3e3)
		const gLimit  = limitTbl[idx-1][0] // global
		const pLimit  = limitTbl[idx-1][min(Game.level,3)] // personal
		if (Pacman.instance.timeNotEaten >= timeOut) fn()
		else (!Game.restarted || globalDotCnt < 0)
			? counters[idx]>= pLimit && fn()
			: globalDotCnt == gLimit && fn(idx == GhsType.Guzuta)
				&& (globalDotCnt = -1)
	}
	function addCnt() {
		(Game.restarted && globalDotCnt >= 0)
			? globalDotCnt++
			: counters[Ghosts.findIndex(g=> g.state.isIdle)]++
	}
	return {release}
})()

export const Elroy = new class {
	static {
		$on('DotEaten',      ()=> Elroy.#dotEaten())
		$on('Title NewLevel',()=> Elroy.#part = 0)
	}
	#part = 0
	#speedRateTbl  = [1, 1.02, 1.05, 1.1]
	#dotsLeftP2Tbl = [20,20,30,40,50,60,70,70,80,90,100,110,120]
	get part() {return this.#part}
	get step() {return Step.Base * this.#speedRateTbl[this.part]}
	get angry() {
		return State.isPlaying
			&& this.part > 1
			&& Ghosts[GhsType.Akabei]?.frightened === false
			&& Ghosts[GhsType.Guzuta]?.started === true
	}
	#dotEaten() {
		const elroyP2 = this.#dotsLeftP2Tbl[Game.clampedLv-1]
		if (Maze.dotsLeft <= elroyP2*([15,10,50][this.part]/10)) {
			++this.#part
			Sound.playSiren()
		}
	}
}

export class FrightMode {
	static #timeTbl = [6,5,4,3,2,5,2,2,1,5,2,1,0] // seconds
	static get time() {return this.#timeTbl[Game.clampedLv-1] * 1000}
	#timeCnt   = 0
	#spriteIdx = 1
	#flashCnt  = 0
	#caughtCnt = 0
	get score()     {return 100 * (1 << this.#caughtCnt)}
	get spriteIdx() {return this.#flashCnt > 0 ? this.#spriteIdx^1:0}
	constructor(ghosts=Ghosts) {
		ghosts != Ghosts && ghosts.forEach((g,i)=> Ghosts[i]=g)
		SysMap.set(FrightMode, this.#toggle(true))
	}
	update() {
		if (!State.isPlaying || Timer.frozen) return
		const {time}= FrightMode
		const et = (Game.interval * this.#timeCnt++)
		const fi = (time == 1000 ? 12:14)/Game.speedRate|0
		const ac = (this.#caughtCnt == GhsType.Max)
		this.#spriteIdx ^= !(this.#flashCnt % fi)
		;(et >= time-2000)  && this.#flashCnt++
		;(et >= time || ac) && this.#toggle(false)
	}
	#toggle(bool) {
		SysMap.delete(FrightMode)
		Sound.toggleFrightMode(bool)
		Ghosts.forEach(g=> $(g).trigger('FrightMode', bool))
		return this
	}
	caught() {this.#caughtCnt++}
}
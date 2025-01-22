import {Sound}   from '../../_snd/sound.js'
import {Ticker}  from '../../_lib/timer.js'
import {Timer}   from '../../_lib/timer.js'
import BaseState from '../../_lib/state.js'
import {GhsType} from '../_constants.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Ctrl}    from '../control.js'
import {PacMgr}  from '../pacman/pac.js'
import {Maze}    from '../maze.js'
import {Ghost}   from './ghost.js'
import {Target}  from './show_targets.js'
import {GhsStep,TileSize as T} from '../_constants.js'

/** @type {Ghost[]} */
const Ghosts = []
const SysMap = new Map()

/** @param {number} idx */
const releaseTime = idx=> ([ // For always chase mode (ms)
	// Pinky->Aosuke->Guzuta
	[1000,  500,  500], // <-After life is lost
	[1000, 4000, 4000], [800, 2200, 4000], [600, 1900, 3500],
	[ 600, 1900, 1500], [500, 1300, 1200], [500, 1300, 1200],
	[ 300,  700,  800], [300,  700,  800], [200,  800,  200],
	[ 200,  800,  200], [100,  700,  200], [100,  700,  200],
	[   0,  900,    0]
][Game.restarted? 0 : Game.clampedLv][idx]/Game.speedRate)

export class GhostState extends BaseState {
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

const inFrontOfPac = g=> !behindThePac(g)
const behindThePac = g=> g.frightened

export const GhsMgr = new class {
	static {$ready(()=> GhsMgr.#setup())}
	#aidx = 0
	get aInterval()  {return 6}
	get animIndex()  {return this.#aidx}
	get Elroy()      {return Elroy}
	get frightened() {return SysMap.has(FrightMode)}
	get score()      {return SysMap.get(FrightMode)?.score|0}
	get spriteIdx()  {return SysMap.get(FrightMode)?.spriteIdx|0}
	get hasEscape()  {return Ghosts.some(g=> g.escaping)}
	centerPos(idx=0) {return Ghosts[idx].centerPos}
	#setup() {
		$(this).on('Reset', this.#onReset)
		$on('Attract',      this.#onAttract)
		$on('Playing',      this.#onPlaying)
		$on('Clear Losing', this.#onLevelEnds)
		PacMgr.bindDotEaten(this.#onDotEaten)
	}
	#onReset(_, ...subClasses) {
		GhsMgr.#aidx = 0
		SysMap.clear()
		subClasses.forEach((cls,i)=> Ghosts[i]=new cls)
	}
	#onAttract(_, ...ghosts) {
		ghosts.forEach((g,i)=> Ghosts[i]=g)
	}
	#onPlaying() {
		Sound.playSiren()
		Ctrl.isChaseMode && Timer.sequence(...Ghosts.slice(1)
			.map((g,i)=> [releaseTime(i), ()=> g.release()]))
	}
	#onDotEaten(_, isPow) {
		if (!isPow) return
		setReversalSignal()
		FrightMode.time && new FrightMode
	}
	#onLevelEnds() {
		SysMap.clear()
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
	crashWithPac(g, pacPos=PacMgr.pos, {fn,radius}={}) {
		if (!(g instanceof Ghost) || !g.state.isWalk) return
		radius ??= (g.frightened? T/2 : T/3)
		collisionCircle(g, pacPos, radius) && g.crashWithPac(fn)
	}
	#draw = (_,i,array)=> array.at(-1-i).draw()
	drawTargets() {Target.draw(Ghosts)}
	drawFront()   {Ghosts.filter(inFrontOfPac).forEach(this.#draw)}
	drawBehind()  {Ghosts.filter(behindThePac).forEach(this.#draw)}
}

export const Wave = function() {
	let mode = 0
	function getTime(idx) {
		const {level:lv}= Game
		return [ // ms
			lv <= 4 ? 4500 : 4000,
			15e3,
			lv <= 4 ? 4500 : 4000,
			15e3,
			3500,
			lv == 1 ? 15e3 : 78e4,
			lv == 1 ? 3500 :(1e3/60),
			Infinity,
		][idx] / Game.speedRate
	}
	function onPlaying() {
		let [cnt,idx]= [-1,0]
		function update() {
			if (Timer.frozen || GhsMgr.frightened) return
			if (Ticker.Interval * ++cnt < getTime(idx)) return
			[cnt,mode]= [0,(++idx % 2)]
			setReversalSignal()
		}
		!(mode = int(Ctrl.isChaseMode))
			&& SysMap.set(Wave, {update})
	}
	$on('Playing', onPlaying)
	return {
		get isScatter() {return mode == 0},
		get isChase()   {return mode == 1},
	}
}()
function setReversalSignal() {
	Ghosts.forEach(g=> {
		$(g).trigger('Reverse')
		FrightMode.time == 0 && $(g).trigger('Runaway')
	})
}

export const DotCounter = function() {
	let globalDotCnt = -1
	const counters = new Uint8Array(GhsType.Max)
	const limitTbl = [[7, 0,0,0],[17, 30,0,0],[32, 60,50,0]]
	/**
	 * @param {number} idx Index of Ghost
	 * @param {(bool:boolean)=> boolean} fn Release ghost
	*/
	function release(idx, fn) {
		const timeOut = (Game.level <= 4 ? 4e3:3e3)
		const gLimit  = limitTbl[idx-1][0] // global
		const pLimit  = limitTbl[idx-1][min(Game.level,3)] // personal
		(PacMgr.instance.timeNotEaten >= timeOut)? fn():
		(!Game.restarted || globalDotCnt < 0)
			? counters[idx]>= pLimit && fn()
			: globalDotCnt == gLimit && fn(idx == GhsType.Guzuta)
				&& (globalDotCnt = -1)
	}
	function reset() {
		!Game.restarted && counters.fill(0)
		globalDotCnt = Game.restarted? 0 : -1
	}
	function addCnt() {
		(Game.restarted && globalDotCnt >= 0)
			? globalDotCnt++
			: counters[Ghosts.findIndex(g=> g.state.isIdle)]++
	}
	$on('Title Ready', reset)
	$ready(()=> PacMgr.bindDotEaten(addCnt))
	return {release}
}()

export const Elroy = function() {
	let part = 0
	const speedRateTbl  = [1, 1.02, 1.05, 1.1]
	const dotsLeftP2Tbl = [20,20,30,40,50,60,70,70,80,90,100,110,120]
	function angry() {
		return State.isPlaying
			&& part > 1
			&& Ghosts[GhsType.Akabei]?.frightened === false
			&& Ghosts[GhsType.Guzuta]?.started === true
	}
	function onDotEaten() {
		const elroyP2 = dotsLeftP2Tbl[Game.clampedLv-1]
		if (Maze.dotsLeft <= elroyP2*([15,10,50][part]/10)) {
			++part
			Sound.playSiren()
		}
	}
	$on('Title NewLevel', ()=> part=0)
	$ready(()=> PacMgr.bindDotEaten(onDotEaten))
	return {
		get part()  {return part},
		get step()  {return GhsStep.Base * speedRateTbl[part]},
		get angry() {return angry()},
	}
}()

export class FrightMode {
	static #timeTbl = [6,5,4,3,2,5,2,2,1,5,2,1,0] // seconds
	static get time() {return this.#timeTbl[Game.clampedLv-1] * 1000}
	static caught() {SysMap.get(FrightMode)?.caught()}
	#timeCnt   = 0
	#flashIdx  = 1
	#flashCnt  = 0
	#caughtCnt = 0
	get score()     {return 100 * (1 << this.#caughtCnt)}
	get spriteIdx() {return this.#flashCnt? this.#flashIdx^1:0}
	constructor() {
		SysMap.set(FrightMode, this.#toggle(true))
	}
	#toggle(bool) {
		SysMap.delete(FrightMode)
		Sound.toggleFrightMode(bool)
		Ghosts.forEach(g=> $(g).trigger('FrightMode', bool))
		return this
	}
	update() {
		if (!State.isPlaying || Timer.frozen) return
		const {time}= FrightMode
		const et = (Game.interval * this.#timeCnt++)
		const fi = (time == 1000 ? 12:14)/Game.speedRate|0
		const ac = (this.#caughtCnt == GhsType.Max)
		this.#flashIdx ^= !(this.#flashCnt % fi)
		;(et >= time-2000)  && this.#flashCnt++
		;(et >= time || ac) && this.#toggle(false)
	}
	caught() {this.#caughtCnt++}
}
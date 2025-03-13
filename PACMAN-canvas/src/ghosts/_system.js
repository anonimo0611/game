import {Sound}   from '../../_snd/sound.js'
import BaseState from '../../_lib/state.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Ctrl}    from '../control.js'
import {Player}  from '../pacman/_pacman.js'
import {Maze}    from '../maze.js'
import {Ghost}   from './_ghost.js'
import {Target}  from './show_targets.js'

/** @type {Ghost[]} */
const Ghosts = []
const SysMap = new Map()

/** @param {number} ghostIdx */
const getReleaseTime = ghostIdx=> ({ // For always chase mode (ms)
	// Pinky->Aosuke->Guzuta
	 0:[1000,  500,  500], // <-After life is lost
	 1:[1000, 4000, 4000], 2:[800, 2200, 4000], 3:[600, 1900, 3500],
	 4:[ 600, 1900, 1500], 5:[500, 1300, 1200], 6:[500, 1300, 1200],
	 7:[ 300,  700,  800], 8:[300,  700,  800], 9:[200,  800,  200],
	10:[ 200,  800,  200],11:[100,  700,  200],12:[100,  700,  200],
	13:[   0,  900,    0]
}[Game.restarted? 0 : Game.clampedLv][ghostIdx]/Game.speedRate)

export class GhostState extends BaseState {
	isIdle   = true
	isGoOut  = false
	isWalk   = false
	isBitten = false
	isEscape = false
	isReturn = false
	constructor({name='Ghost',isInHouse=false}={}) {
		super()
		const state = name == 'Ghost'
			? 'Walk' : (isInHouse? 'Idle':'GoOut')
		this.init(state)
	}
	get isEscaping() {
		return this.isEscape || this.isReturn
	}
}

const inFrontOfPac = g=> !behindThePac(g)
const behindThePac = g=> g.frightened

export const GhsMgr = new class {
	static {$ready(()=> this.setup())}
	static setup() {
		$on('Attract',GhsMgr.#onAttract)
		$on('Playing',GhsMgr.#onPlaying)
		$on('Clear',  GhsMgr.#onLevelEnds)
		$on('Crashed',GhsMgr.#onLevelEnds)
		$(GhsMgr).on('Init',GhsMgr.#initialize)
		Player.bindDotEaten(GhsMgr.#onDotEaten)
	}
	#aidx = 0
	get aInterval()  {return 6}
	get animIndex()  {return this.#aidx}
	get Elroy()      {return Elroy}
	get frightened() {return SysMap.has(FrightMode)}
	get score()      {return SysMap.get(FrightMode)?.score|0}
	get spriteIdx()  {return SysMap.get(FrightMode)?.spriteIdx|0}
	get hasEscape()  {return Ghosts.some(g=> g.escaping)}
	get akaCenter()  {return Ghosts[GhsType.Akabei].centerPos}

	#initialize(_, ...subClasses) {
		GhsMgr.#aidx = 0
		SysMap.clear()
		subClasses.forEach((cls,i)=> Ghosts[i]=new cls)
	}
	#onLevelEnds() {
		SysMap.clear()
		Ghosts.forEach(g=> g.sprite.setFadeOut())
	}
	#onAttract(_, ...ghosts) {
		ghosts.forEach((g,i)=> Ghosts[i]=g)
	}
	#onPlaying() {
		Sound.playSiren()
		Ctrl.isChaseMode && Timer.sequence(...Ghosts.slice(1)
			.map((g,i)=> [getReleaseTime(i), ()=> g.release()]))
	}
	#onDotEaten(_, isPow) {
		if (!isPow) return
		setReversalSignal()
		FrightMode.time && new FrightMode
	}
	update() {
		if (State.isPlaying
		 || State.isAttract
		 || State.isCBreak)
			this.#aidx ^= !Timer.frozen && !(Ticker.count % this.aInterval)
		SysMap.forEach(s=> s.update())
		Ghosts.forEach(g=> g.update())
	}
	/** @param {Ghost} g */
	crashWithPac(g, pacPos=Player.pos, {fn,radius}={}) {
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
	const genTimeList = lv=>
	freeze([ // ms
		lv <= 4 ? 4500 : 4000,
		15e3,
		lv <= 4 ? 4500 : 4000,
		15e3,
		3500,
		lv == 1 ? 15e3 : 78e4,
		lv == 1 ? 3500 :(1e3/60),
		Infinity,
	])
	function onPlaying() {
		let   [cnt,idx]= [-1,0]
		const TimeList = genTimeList(Game.level)
		const duration = idx=> TimeList[idx] / Game.speedRate
		function update() {
			if (Timer.frozen || GhsMgr.frightened) return
			if (Ticker.Interval * ++cnt < duration(idx)) return
			[cnt,mode]= [0,(++idx % 2)]
			setReversalSignal()
		}
		!(mode=+Ctrl.isChaseMode) && SysMap.set(Wave,{update})
	}
	$on('Playing', onPlaying)
	return {
		get isScatter() {return mode == 0},
		get isChase()   {return mode == 1},
	}
}()
function setReversalSignal() {
	$(Ghosts).trigger('Reverse')
	!FrightMode.time && $(Ghosts).trigger('Runaway')
}

export const DotCounter = function() {
	let globalDotCnt = -1
	const counters = new Uint8Array(GhsType.Max)
	const limitTbl = freeze([
	    //  global,lv1,lv2,lv3+
		freeze([ 7,  0,  0, 0]),  // Pinky
		freeze([17, 30,  0, 0]),  // Aosuke
		freeze([32, 60, 50, 0])]) // Guzuta
	/**
	 * @param {number} idx Ghost index
	 * @param {(deactivateGlobal:boolean)=> boolean} fn Release ghost
	 */
	function release(idx, fn) {
		const timeOut = (Game.level <= 4 ? 4e3:3e3)
		const gLimit  = limitTbl[idx-1][0] // global
		const pLimit  = limitTbl[idx-1][min(Game.level,3)] // personal
		;(Player.instance.timeNotEaten >= timeOut)? fn()
		:(!Game.restarted || globalDotCnt < 0)
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
	$ready(()=> Player.bindDotEaten(addCnt))
	return {release}
}()

export const Elroy = function() {
	let part = 0
	const speedRateTbl  = freeze([1, 1.02, 1.05, 1.1])
	const dotsLeftP2Tbl = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
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
	$ready(()=> Player.bindDotEaten(onDotEaten))
	return {
		get part()  {return part},
		get step()  {return GhsStep.Base * speedRateTbl[part]},
		get angry() {return angry()},
	}
}()

export class FrightMode {
	static #timeTbl = freeze([6,5,4,3,2,5,2,2,1,5,2,1,0])
	static get time() {return this.#timeTbl[Game.clampedLv-1]}
	static caught() {SysMap.get(FrightMode)?.caught()}
	#timeCnt   = 0
	#flashIdx  = 1
	#flashCnt  = 0
	#caughtCnt = 0
	get score()     {return 100 * (1 << this.#caughtCnt)}
	get spriteIdx() {return this.#flashCnt? this.#flashIdx^1:0}
	constructor() {
		SysMap.set(FrightMode, this.#toggle(true))
		freeze(this)
	}
	#toggle(bool) {
		SysMap.delete(FrightMode)
		Sound.toggleFrightMode(bool)
		$(Ghosts).trigger('FrightMode',bool)
		return this
	}
	update() {
		if (!State.isPlaying || Timer.frozen) return
		const {time}= FrightMode
		const elapsedT  = (Game.interval*this.#timeCnt++)/1e3
		const fInterval = (time == 1 ? 12:14)/Game.speedRate|0
		const caughtAll = (this.#caughtCnt == GhsType.Max)
		this.#flashIdx ^=!(this.#flashCnt % fInterval)
		;(elapsedT>=time - 2) && this.#flashCnt++
		;(elapsedT>=time || caughtAll) && this.#toggle(false)
	}
	caught() {this.#caughtCnt++}
}
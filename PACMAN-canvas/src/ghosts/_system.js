import _State   from '../../_lib/state.js'
import {Common} from '../../_lib/common.js'
import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Player} from '../pacman.js'
import {Maze}   from '../maze.js'
import {PtsMgr} from '../points.js'
import * as Pts from '../sprites/points.js'
import {Ghost}  from './ghost.js'
import Target   from './show_targets.js'

const PtsLst = Pts.Vals.Ghost
const Ghosts = /**@type {Ghost[]}*/([])

/** Delay time (ms) before the ghost departs from the house in always chase mode */
const ReleaseDelay = /**@type {const}*/
([//Pinky->Aosuke->Guzuta
	[1000,  500,  500], // Restart
	[1000, 4000, 4000], // Lv.1
	[ 800, 2200, 4000], // Lv.2
	[ 600, 1900, 3500], // Lv.3
	[ 600, 1900, 1500], // Lv.4
	[ 500, 1300, 1200], // Lv.5
	[ 500, 1300, 1200], // Lv.6
	[ 300,  700,  800], // Lv.7
	[ 300,  700,  800], // Lv.8
	[ 200,  800,  200], // Lv.9
	[ 200,  800,  200], // Lv.10
	[ 100,  700,  200], // Lv.11
	[ 100,  700,  200], // Lv.12
	[   0,  900,    0], // Lv.13
])

/** @typedef {'Idle'|'GoOut'|'Walk'|'Bitten'|'Escape'|'Return'} State */
export class GhostState extends _State {
	isIdle   = false
	isGoOut  = false
	isWalk   = false
	isBitten = false
	isEscape = false
	isReturn = false

	get current()    {return /**@type {State}*/(super.current)}
	get isEscaping() {return this.isEscape || this.isReturn}

	constructor(/**@type {Ghost}*/{tilePos}) {
		super()
		this.init(Maze.House.isIn(tilePos)? 'Idle':'Walk')
	}
	to(/**@type {State}*/state) {
		return super.to(state)
	}
}

export const GhsMgr = new class extends Common {
	static {$(this.setup)}
	static setup() {
		State.on({
			Playing:GhsMgr.#onPlaying,
			Clear:  GhsMgr.#onLevelEnds,
			Crashed:GhsMgr.#onLevelEnds,
		})
		GhsMgr.on({Init:GhsMgr.#initialize})
	}
	#aIdx = /**@type {0|1}*/(0)
	get animIndex() {return this.#aIdx}
	get aInterval() {return Ticker.count % 6 == 0}
	get Elroy()     {return Elroy}
	get isChasing() {return AlternateBetweenModes.isChasing}
	get isScatter() {return AlternateBetweenModes.isScatter}
	get isFright()  {return FrightMode.session != null}
	get score()     {return FrightMode.session?.score ?? PtsLst[0]}
	get spriteIdx() {return FrightMode.session?.spriteIdx ?? 0}
	get caughtAll() {return FrightMode.session?.caughtAll ?? false}
	get hasEscape() {return Ghosts.some(g=> g.state.isEscaping)}
	get akaCenter() {return Ghosts[GhsType.Akabei].center}

	#initialize(_={}, /**@type {Ghost[]}*/...ghosts) {
		GhsMgr.#aIdx = 0
		ghosts.forEach((g,i)=> Ghosts[i] = g)
	}
	#onLevelEnds() {
		Ghosts.forEach(g=> g.sprite.setFadeOut())
	}
	#onPlaying() {
		Sound.playSiren()
		GhsMgr.#setReleaseTimer()
	}
	#setReleaseTimer() {
		if (!Ctrl.isChaseMode) return
		const lv = (Game.restarted? 0 : Game.clampedLv)
		Timer.sequence(...Ghosts.slice(1).map((g,i)=>
			({ms:ReleaseDelay[lv][i]/Game.speedRate, fn:g.release})))
	}
	setFrightMode() {
		setReversalSig()
		FrightMode.new()
	}
	update() {
		if (State.isPlaying
		 || State.isAttract
		 || State.isCoffBrk) {
			this.#aIdx ^= +(!Timer.frozen && GhsMgr.aInterval)
		}
		AlternateBetweenModes.update()
		FrightMode.session?.update()
		Ghosts.forEach(g=> g.update())
	}
	#draw(onFront=true) {
		Ghosts.forEach((_,i,a, g=a.at(-1-i))=> {
			g && (g.isFright != onFront) && g.draw()
		})
	}
	drawBehind() {
		GhsMgr.#draw(false)
	}
	drawFront()  {
		Target.draw(Ghosts)
		GhsMgr.#draw(true)
		PtsMgr.drawGhostPts()
	}
}

const SCATTER = 0
const CHASING = 1
const AlternateBetweenModes = function() {
	{
		let seq = {mode:SCATTER,update(){}}
		State.on({_Ready:()=> seq = genSequence()})
		return {
			get isChasing() {return seq.mode == CHASING},
			get isScatter() {return seq.mode == SCATTER},
			update() {State.isPlaying && seq.update()},
		}
	}
	function genDurList() {
		const {level:lv}= Game
		return freeze([ // ms
			lv <= 4 ? 4500 : 4000,
			15e3,
			lv <= 4 ? 4500 : 4000,
			15e3,
			3500,
			lv == 1 ? 15e3 : 78e4,
			lv == 1 ? 3500 : 16.7,
			Infinity,
		])
	}
	function genSequence() {
		let  [cnt,idx] = [-1,0]
		const durList  = genDurList()
		const duration = ()=> durList[idx]/Game.speedRate
		const seq = {
			mode: [SCATTER,CHASING][+Ctrl.isChaseMode],
			update() {
				if (Timer.frozen
				 || GhsMgr.isFright
				 || Ticker.Interval*(++cnt) < duration())
					return
				[cnt,seq.mode] = [0,(++idx % 2)]
				setReversalSig()
			}
		};return [seq,{mode:CHASING,update(){}}][seq.mode]
	}
}(),
setReversalSig = ()=> {
	$(Ghosts).trigger('Reverse')
	FrightMode.numOfSecs == 0 && $(Ghosts).trigger('Runaway')
}

export const DotCounter = function() {
	let _globalCounter = -1
	const pCounters  = new Uint8Array(GhsType.Max)
	const limitTable = /**@type {const}*/
		([//global,lv1,lv2,lv3+
			[ 7,  0,  0, 0], // Pinky
			[17, 30,  0, 0], // Aosuke
			[32, 60, 50, 0], // Guzuta
		])
	/**
	 * @param {number} idx Pinky, Aosuke, Guzuta's index
	 * @param {(deactivateGlobal?:boolean)=> boolean} fn Release ghost
	 */
	function release(idx, fn) {
		const timeOut = Game.level <= 4 ? 4e3 : 3e3
		const gLimit  = limitTable[idx-1][0] // global
		const pLimit  = limitTable[idx-1][min(Game.level,3)] // personal
		;(Player.i.timeNotEaten >= timeOut)? fn()
		:(!Game.restarted || _globalCounter < 0)
			? (pCounters[idx] >= pLimit)
				&& fn()
			: (_globalCounter == gLimit)
				&& fn(idx == GhsType.Guzuta)
				&& (_globalCounter = -1)
		}
	function reset() {
		!Game.restarted && pCounters.fill(0)
		_globalCounter = Game.restarted? 0 : -1
	}
	function addCnt() {
		(Game.restarted && _globalCounter >= 0)
			? _globalCounter++
			: pCounters[Ghosts.findIndex(g=> g.state.isIdle)]++
	}
	State.on({_Ready:reset})
	$(()=> Player.on({Eaten:addCnt}))
	return {release}
}()

const Elroy = function() {
	let _part = 0
	const spdRatesTable = freeze([1, 1.02, 1.05, 1.1])
	const dotsLeftTable = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
	function angry() {
		return State.isPlaying
			&& _part > 1
			&& Ghosts[GhsType.Akabei]?.isFright  === false
			&& Ghosts[GhsType.Guzuta]?.isStarted === true
	}
	function onDotEaten() {
		const left = dotsLeftTable[Game.clampedLv-1]
		if (Maze.dotsLeft <= left*([1.5, 1.0, 0.5][_part])) {
			++_part
			Sound.playSiren()
		}
	}
	State.on({_NewLevel:()=> _part = 0})
	$(()=> Player.on({Eaten:onDotEaten}))
	return {
		get part()  {return _part},
		get step()  {return GhsStep.Base * spdRatesTable[_part]},
		get angry() {return angry()},
	}
}()

const FrightMode = function() {
	let   _session  = /**@type {?Session}*/(null)
	const TimeTable = freeze([6,5,4,3,2,5,2,2,1,5,2,1,0]) // secs
	class Session {
		#tCounter = 0; #fCounter  = 0;
		#flashIdx = 1; #caughtCnt = 0;
		get score()     {return PtsLst[this.#caughtCnt-1]}
		get spriteIdx() {return this.#flashIdx^1}
		get caughtAll() {return this.#caughtCnt == GhsType.Max}

		/** @readonly */
		dur = TimeTable[Game.clampedLv-1]
		constructor() {
			_session = this.#toggle(true)
			$(Ghosts).on('Cought', ()=> this.#caughtCnt++)
		}
		#toggle(/**@type {boolean}*/bool) {
			_session = null
			$(Ghosts).off('Cought').trigger('FrightMode', bool)
			Sound.toggleFrightMode(bool)
			return this
		}
		#flashing() {
			const iv = (this.dur == 1 ? 12:14)/Game.speedRate|0
			this.#flashIdx ^= Number(this.#fCounter++ % iv == 0)
		}
		update() {
			if (!State.isPlaying || Timer.frozen) return
			const t = (this.#tCounter++ * Game.interval)/1000
			;(t >= this.dur-2) && this.#flashing()
			;(t >= this.dur || this.caughtAll) && this.#toggle(false)
 		}
	}
	GhsMgr.on({Init:()=> _session = null})
	return {
		get session()   {return _session},
		get numOfSecs() {return _session?.dur ?? -1},
		new() {(State.isAttract || this.numOfSecs) && new Session},
	}
}()
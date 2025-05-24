import _State   from '../../_lib/state.js'
import {Common} from '../../_lib/common.js'
import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Player} from '../pacman.js'
import {Maze}   from '../maze.js'
import {Ghost}  from './ghost.js'
import Target   from './show_targets.js'

/** @type {Ghost[]} */
const Ghosts = []

/** @type {(ghostIdx:number)=> number} */
const releaseDelay = idxOfGhsInHouse=> ({ // For always chase mode(ms)
	// Pinky->Aosuke->Guzuta
	 0:[1000,  500,  500], // <-After life is lost
	 1:[1000, 4000, 4000], 2:[800, 2200, 4000], 3:[600, 1900, 3500],
	 4:[ 600, 1900, 1500], 5:[500, 1300, 1200], 6:[500, 1300, 1200],
	 7:[ 300,  700,  800], 8:[300,  700,  800], 9:[200,  800,  200],
	10:[ 200,  800,  200],11:[100,  700,  200],12:[100,  700,  200],
	13:[   0,  900,    0]
}[Game.restarted? 0 : Game.clampedLv][idxOfGhsInHouse]/Game.speedRate)

/** @type {(ghost:Ghost, tile:Vector2, dir:Direction)=> boolean} */
export const notEnter = (ghost, tile, dir)=> {
	return !Ctrl.unrestricted
		&& !ghost.isFright
		&& !ghost.isEscaping
		&& (dir == U && Maze.GhostNotEnterSet.has(tile.hyphenated))
}

/** @typedef {'Idle'|'GoOut'|'Walk'|'Bitten'|'Escape'|'Return'} StateType */
export class GhostState extends _State {
	isIdle   = true
	isGoOut  = false
	isWalk   = false
	isBitten = false
	isEscape = false
	isReturn = false

	get isEscaping() {
		return this.isEscape || this.isReturn
	}
	get current() {
		return /**@type {StateType}*/(super.current)
	}
	/** @param {Ghost} Ghost */
	constructor({tilePos}) {
		super()
		this.init(Maze.House.isIn(tilePos)? 'Idle':'Walk')
	}
	/** @param {StateType} state */
	to(state) {return super.to(state)}
}

export const GhsMgr = new class extends Common {
	static {$ready(this.setup)}
	static setup() {
		$on({
			Playing:GhsMgr.#onPlaying,
			Clear:  GhsMgr.#onLevelEnds,
			Crashed:GhsMgr.#onLevelEnds,
		})
		GhsMgr.on({Init:GhsMgr.#initialize})
	}
	#aidx = 0
	get aInterval() {return 6}
	get animIndex() {return this.#aidx}
	get Elroy()     {return Elroy}
	get isScatter() {return AlternateBetweenModes.isScatter}
	get isFright()  {return FrightMode.instance != null}
	get score()     {return FrightMode.instance?.score     ?? 0}
	get spriteIdx() {return FrightMode.instance?.spriteIdx ?? 0}
	get caughtAll() {return FrightMode.instance?.caughtAll ?? false}
	get hasEscape() {return Ghosts.some(g=> g.isEscaping)}
	get akaCenter() {return Ghosts[GhsType.Akabei].centerPos}

	/**
	 * @param {unknown } _
	 * @param {...Ghost} instances
	 */
	#initialize(_, ...instances) {
		GhsMgr.#aidx = 0
		instances.forEach((g,i)=> Ghosts[i]=g)
	}
	#onLevelEnds() {
		Ghosts.forEach(g=> g.sprite.setFadeOut())
	}
	#onPlaying() {
		Sound.playSiren()
		Ctrl.isChaseMode &&
			Timer.sequence(...Ghosts.slice(1).map(
				/** @returns {[number,Function]} */
				(g,i)=> [releaseDelay(i), ()=> g.release()])
			)
	}
	setFrightMode() {
		setReversalSig()
		FrightMode.new()
	}
	update() {
		if (State.isPlaying
		 || State.isAttract
		 || State.isCoffBrk)
			this.#aidx ^= +(!Timer.frozen && !(Ticker.count % this.aInterval))
		AlternateBetweenModes.update()
		FrightMode.instance?.update()
		Ghosts.forEach(g=> g.update())
	}
	drawTarget() {Target.draw(Ghosts)}
	drawFront()  {Ghosts.forEach((g,i,a)=>!g.isFright && a.at(-1-i)?.draw())}
	drawBehind() {Ghosts.forEach((g,i,a)=> g.isFright && a.at(-1-i)?.draw())}
}

const SCATTER = 0
const CHASE   = 1
const AlternateBetweenModes = function() {
	{
		let seq={mode:0,update(){}}
		$on({Title_Ready:()=> seq=genSequence()})
		return {
			get isScatter() {return seq.mode == SCATTER},
			update() {State.isPlaying && seq.update()},
		}
	}
	/** @param {number} lv */
	function genDurList(lv) {
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
		const durList  = genDurList(Game.level)
		const duration = ()=> durList[idx]/Game.speedRate
		const Seq = {
			mode: +Ctrl.isChaseMode,
			update() {
				if (Timer.frozen
				 || GhsMgr.isFright
				 || Ticker.Interval*(++cnt) < duration())
					return
				[cnt,Seq.mode] = [0,(++idx % 2)]
				setReversalSig()
			}
		};return Seq.mode? {mode:CHASE,update(){}}:Seq
	}
}(),
setReversalSig = ()=> {
	$(Ghosts).trigger('Reverse')
	!FrightMode.numOfSec && $(Ghosts).trigger('Runaway')
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
	$on({Title_Ready:reset})
	$ready(()=> Player.on({DotEaten:addCnt}))
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
	$on({Title_NewLevel:()=> _part=0})
	$ready(()=> Player.on({DotEaten:onDotEaten}))
	return {
		get part()  {return _part},
		get step()  {return GhsStep.Base * spdRatesTable[_part]},
		get angry() {return angry()},
	}
}()

class FrightMode {
	/** @private @readonly */
	static TimeTable = freeze([6,5,4,3,2,5,2,2,1,5,2,1,0]) // secs
	static #instance = /**@type {?FrightMode}*/(null)
	static get instance() {return this.#instance}
	static get numOfSec() {return this.TimeTable[Game.clampedLv-1]}
	static new() {(State.isAttract || this.numOfSec) && new this()}
	static {GhsMgr.on({Init:()=> this.#instance=null})}

	#tCounter = 0; #fCounter  = 0;
	#flashIdx = 1; #caughtCnt = 0;

	get score()     {return 100 * (1 << this.#caughtCnt)}
	get spriteIdx() {return this.#fCounter? this.#flashIdx^1:0}
	get caughtAll() {return this.#caughtCnt == GhsType.Max}

	/** @private */
	constructor() {
		FrightMode.#instance = this.#toggle(true)
		$(Ghosts).on('Cought', ()=> ++this.#caughtCnt)
	}
	/** @param {boolean} bool */
	#toggle(bool) {
		FrightMode.#instance = null
		$(Ghosts).off('Cought').trigger('FrightMode', bool)
		Sound.toggleFrightMode(bool)
		return this
	}
	update() {
		if (!State.isPlaying || Timer.frozen) return
		const {numOfSec}= FrightMode
		const et = (Game.interval * this.#tCounter++)/1000
		const fi = (numOfSec == 1 ? 12:14)/Game.speedRate|0
		this.#flashIdx ^= +!(this.#fCounter % fi)
		;(et >= numOfSec-2) && this.#fCounter++
		;(et >= numOfSec || this.caughtAll) && this.#toggle(false)
	}
}
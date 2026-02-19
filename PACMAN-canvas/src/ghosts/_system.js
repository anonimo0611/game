import _State   from '../../_lib/state.js'
import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {PtsMgr} from '../points.js'
import * as Pts from '../sprites/points.js'
import {Player} from '../player/player.js'
import {Ghost}  from './ghost.js'
import Target   from './show_targets.js'

const PtsLst = Pts.GhostPts
const Ghosts = /**@type {Ghost[]}*/([])

export const Events = toEnumObject(
	['Ready','Reverse','FrightMode','FleeTime','RoundEnds']
)
/**
 When always chase mode,
 standby time(ms) before the ghost leaves from the house
*/
const StandbyTimes = /**@type {const}*/
([//Pinky->Aosuke->Guzuta
	[1000, 2000, 3000], // Restart
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
	[   0,  900,    0], // Lv.13+
])

/** @typedef {typeof States[number]} StateType */
const States = /**@type {const}*/(
	['Idle','GoingOut','Roaming','Bitten','Escaping','Returning'])

const StateTypes = toEnumObject(States)

/**
 @extends {_State<Ghost,StateType>}
 @typedef {GhsState & StateDef.Props<globalThis,StateType>} IGhsState
*/
class GhsState extends _State {
	/** @this {IGhsState} */
	constructor(/**@type {Ghost}*/g) {
		super(g)
		this.init(States).owner.inHouse
			? this.toIdle()
			: this.toRoaming()
	}
	/** @this {IGhsState} */
	get isEscapingEyes() {
		return this.isEscaping || this.isReturning
	}
	to(/**@type {StateType}*/s) {
		$(this.owner).trigger(s)
		return super.to(s)
	}
}
export const createState =
	(/**@type {Ghost}*/g)=>
	 /**@type {IGhsState}*/(new GhsState(g))

export const GhsMgr = new class {
	static {$(this.setup)}
	static setup() {
		State.on({
			InGame:   GhsMgr.#onInGame,
			Ready:    ()=> $(Ghosts).trigger(Events.Ready),
			Cleared:  ()=> $(Ghosts).trigger(Events.RoundEnds),
			PacCaught:()=> $(Ghosts).trigger(Events.RoundEnds),
		})
	}
	#animIdx = 0
	get animIndex()      {return this.#animIdx}
	get CruiseElroy()    {return CruiseElroy}
	get isChaseMode()    {return AttackInWaves.isChaseMode}
	get isScatterMode()  {return AttackInWaves.isScatterMode}
	get isFrightMode()   {return FrightMode.session != null}
	get points()         {return FrightMode.session?.points ?? PtsLst[0]}
	get spriteIdx()      {return FrightMode.session?.spriteIdx ?? 0}
	get caughtAll()      {return FrightMode.session?.caughtAll ?? false}
	get akaCenterPos()   {return Ghosts[GhsType.Akabei].center}
	get areAnyEscaping() {return Ghosts.some(g=> g.isEscaping)}

	initialize(/**@type {readonly Ghost[]}*/ghosts) {
		GhsMgr.#animIdx = 0
		ghosts.forEach((g,i)=> Ghosts[i] = g)
	}
	#onInGame() {
		Sound.playSiren()
		Ctrl.alwaysChase && GhsMgr.#setReleaseTimer()
	}
	#setReleaseTimer() {
		const lv = (Game.restarted? 0 : Game.clampedLv)
		Timer.sequence(...
			Ghosts.slice(1).map((g,i)=> ({
				ms: StandbyTimes[lv][i]/Game.speed,
				fn: ()=> g.leaveHouse()
			}))
		)
	}
	setFrightMode() {
		FrightMode.new()
	}
	update() {
		AttackInWaves.update()
		FrightMode.session?.update()
		GhsMgr.#updateAnimation()
		GhsMgr.#updateGhosts()
	}
	#updateAnimation() {
		if (Timer.frozen)
			return
		if (State.isInGame
		 || State.isDemoMode)
			GhsMgr.#animIdx ^= +(Ticker.count % 6 == 0)
	}
	#updateGhosts() {
		Ghosts.forEach(g=> g.update())
	}
	drawBehind() {
		GhsMgr.#draw(false)
	}
	drawFront()  {
		Target.draw(Ghosts)
		GhsMgr.#draw(true)
		PtsMgr.drawGhostPts()
	}
	#draw(onFront=true) {
		Ghosts
			.toReversed()
			.filter (g=> g.isFrightened != onFront)
			.filter (g=> g.state.isBitten == false)
			.forEach(g=> g.draw())
	}
}

const signalDirectionReversal = ()=> {
	$(Ghosts).trigger(Events.Reverse)
}
const AttackInWaves = function() {
	const SCATTER = 0
	const CHASE   = 1
	{
		let phase = create()
		State.on({_Ready:()=> phase = create(Game.level)})
		return {
			get isChaseMode()   {return phase.mode == CHASE},
			get isScatterMode() {return phase.mode == SCATTER},
			update() {State.isInGame && phase.update?.()},
		}
	}
	function create(lv=1) {
		let idx  = 0, et = 0
		let mode = Ctrl.alwaysChase? CHASE:SCATTER
		const list = /**@type {const}*/([
			{mode:SCATTER, dur:lv <= 4 ? 4500 : 4000},
			{mode:CHASE,   dur:15e3},
			{mode:SCATTER, dur:lv <= 4 ? 4500 : 4000},
			{mode:CHASE,   dur:15e3},
			{mode:SCATTER, dur:3500},
			{mode:CHASE,   dur:lv == 1 ? 15e3 : 78e4},
			{mode:SCATTER, dur:lv == 1 ? 3500 : 16.7},
			{mode:CHASE,   dur:Infinity},
		])
		function update() {
			if ((Timer.frozen || GhsMgr.isFrightMode)
			 || (et+=Game.interval) < list[idx].dur)
				return
			[et,mode]= [0,list[++idx].mode]
			signalDirectionReversal()
		}
		return {
			get mode() {return mode},
			...{update:mode == CHASE ? null:update},
		}
	}
}()

export const DotCounter = function() {
	let  _globalCounter = -1
	const personalCounters = new Uint8Array(GhsType.Max)
	const LimitTable = /**@type {const}*/
		([//global,lv1,lv2,lv3+
			[ 7,  0,  0, 0], // Pinky
			[17, 30,  0, 0], // Aosuke
			[32, 60, 50, 0], // Guzuta
		])
	/**
	 @param {number} i Index of Pinky, Aosuke or Guzuta
	 @param {(deactivateGlobal?:boolean)=> boolean} fn
	*/
	function releaseIfReady(i, fn) {
		const lvIdx   = min(Game.level,3)
		const timeout = (Game.level<=4 ? 4e3:3e3)
		const gLimit  = LimitTable[i-1][0] // global
		const pLimit  = LimitTable[i-1][lvIdx] // personal
		;(Player.core.timeSinceLastEating >= timeout)
			? fn()
			: (!Game.restarted || _globalCounter < 0)
				? (personalCounters[i] >= pLimit)
					&& fn()
				: (_globalCounter == gLimit)
					&& fn(i == GhsType.Guzuta)
					&& (_globalCounter = -1)
		}
	function reset() {
		!Game.restarted && personalCounters.fill(0)
		_globalCounter = Game.restarted? 0:-1
	}
	function increaseCounter() {
		(Game.restarted && _globalCounter >= 0)
			? _globalCounter++
			: incPreferredGhostCounter()
	}
	function incPreferredGhostCounter() {
		const
		idx = Ghosts.findIndex(g=> g.state.isIdle)
		idx != -1 && personalCounters[idx]++
	}
	State.on({_Ready:reset})
	Player.onAte(increaseCounter)
	return {releaseIfReady}
}()

const CruiseElroy = function() {
	let  _part = 0
	const Accelerations = freeze([1.00, 1.02, 1.05, 1.1])
	const DotsLeftTable = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
	function angry() {
		return State.isInGame
			&& _part > 1
			&& Ghosts[GhsType.Akabei]?.isFrightened == false
			&& Ghosts[GhsType.Guzuta]?.isStarted == true
	}
	function onDotEaten() {
		const rate = [1.5, 1.0, 0.5][_part]
		if (Maze.dotsLeft <= DotsLeftTable[Game.clampedLv-1]*rate)
			++_part && Sound.playSiren()
	}
	State.on({_NewLevel:()=> _part=0})
	Player.onAte(onDotEaten)
	return {
		get part()  {return _part},
		get angry() {return angry()},
		get speed() {return GhsSpeed.Base * Accelerations[_part]},
	}
}()

const FrightMode = function() {
	let   _session  = /**@type {?Readonly<Session>}*/(null)
	const TimeTable = freeze([6,5,4,3,2,5,2,2,1,5,2,1,0]) // secs
	class Session {
		#et=0; #flash=0; #caught=0; #fIdx=1
		get points()    {return PtsLst[this.#caught-1]}
		get caughtAll() {return this.#caught == GhsType.Max}
		get spriteIdx() {return this.#flash && this.#fIdx^1}
		constructor() {
			signalDirectionReversal()
			this.Dur = TimeTable[Game.clampedLv-1]
			this.Dur == 0 && !State.isAttract
				? $(Ghosts).trigger(Events.FleeTime)
				: this.#set(true)
		}
		#set(isOn=false) {
			_session = (isOn? this : null)
			$(Ghosts)
				.trigger(Events.FrightMode, isOn)
				.offon(StateTypes.Bitten, ()=> this.#caught++, isOn)
			Sound.toggleFrightMode(isOn)
		}
		#flashing() {
			const iv = (this.Dur == 1 ? 12:14)/Game.speed|0
			this.#flash++ % iv == 0 && (this.#fIdx ^= 1)
		}
		update() {
			if (State.isInGame && !Timer.frozen) {
				const et = (this.#et += Game.interval)/1e3
				if (et >= this.Dur-2) this.#flashing()
				if (et >= this.Dur || this.caughtAll) this.#set()
			}
 		}
	}
	State.on({_Ready:()=> _session = null})
	return {
		new() {new Session()},
		get session() {return _session},
	}
}()
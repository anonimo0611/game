import _State   from '../../_lib/state.js'
import {Common} from '../../_lib/common.js'
import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {PtsMgr} from '../points.js'
import * as Pts from '../sprites/points.js'
import {Player} from '../player/player.js'
import {player} from '../player/player.js'
import {Ghost}  from './ghost.js'
import Target   from './show_targets.js'

const PtsLst = Pts.GhostPts
const Ghosts = /**@type {Ghost[]}*/([])

/**
 When always chase mode,
 standby time(ms) before the ghost leaves from the house
*/
const StandbyTimes = /**@type {const}*/
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
	[   0,  900,    0], // Lv.13+
])

/**
 @extends {_State<Ghost,StateType>}
 @typedef {'Idle'|'GoingOut'|'Walking'|'Bitten'|'Escaping'|'Returning'} StateType
*/
export class GhostState extends _State {
	isIdle      = false
	isGoingOut  = false
	isWalking   = false
	isBitten    = false
	isEscaping  = false
	isReturning = false
	constructor(/**@type {Ghost}*/g) {
		super(g)
		this.init().owner.inHouse
			? this.toIdle()
			: this.toWalking()
	}
	get toIdle()      {return this.ret('Idle')}
	get toGoingOut()  {return this.ret('GoingOut')}
	get toWalking()   {return this.ret('Walking')}
	get toBitten()    {return this.ret('Bitten')}
	get toEscaping()  {return this.ret('Escaping')}
	get toReturning() {return this.ret('Returning')}
	set(/**@type {StateType}*/state) {
		$(this.owner).trigger(state)
		return super.set(state)
	}
}

export const GhsMgr = new class extends Common {
	static {$(this.setup)}
	static setup() {
		State.on({
			InGame:   GhsMgr.#onInGame,
			Cleared:  GhsMgr.#onRoundEnds,
			PacCaught:GhsMgr.#onRoundEnds,
		})
		GhsMgr.on({Init:GhsMgr.#initialize})
	}
	#animIdx = 0
	get animIndex()      {return this.#animIdx}
	get animFlag()       {return Ticker.count % 6 == 0}
	get CruiseElroy()    {return CruiseElroy}
	get isChaseMode()    {return AttackInWaves.isChaseMode}
	get isScatterMode()  {return AttackInWaves.isScatterMode}
	get isFrightMode()   {return FrightMode.session != null}
	get points()         {return FrightMode.session?.score ?? PtsLst[0]}
	get spriteIdx()      {return FrightMode.session?.spriteIdx ?? 0}
	get caughtAll()      {return FrightMode.session?.caughtAll ?? false}
	get akaCenterPos()   {return Ghosts[GhsType.Akabei].center}
	get areAnyEscaping() {return Ghosts.some(g=> g.escaping)}

	#initialize(_={}, /**@type {Ghost[]}*/...ghosts) {
		GhsMgr.#animIdx = 0
		ghosts.forEach((g,i)=> Ghosts[i]=g)
	}
	#onRoundEnds() {
		Ghosts.forEach((g)=> g.sprite.setFadeOut())
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
		if (State.isInGame
		 || State.isAttract
		 || State.isCoffBreak)
			this.#animIdx ^= +(!Timer.frozen && GhsMgr.animFlag)
		AttackInWaves.update()
		FrightMode.session?.update()
		Ghosts.forEach(g=>g.update())
	}
	#draw(onFront=true) {
		reverse(Ghosts).forEach(
			g=> (g.frightened != onFront) && g.draw()
		)
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

const queueDirectionReverse = ()=> {
	$(Ghosts).trigger('Reverse')
}
const SCATTER = 0, CHACE = 1
const AttackInWaves = function() {
	const initPhase = (mode=SCATTER)=> ({mode,update(){}})
	{
		let phase = initPhase()
		State.on({_Ready:()=> phase = genPhase()})
		return {
			get isChaseMode()   {return phase.mode == CHACE},
			get isScatterMode() {return phase.mode == SCATTER},
			update() {State.isInGame && phase.update()},
		}
	}
	function genPhaseList() {
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
	function genPhase() {
		let  [time,idx] = [-1,0]
		const list  = genPhaseList()
		const phase = {
			mode: [SCATTER,CHACE][+Ctrl.alwaysChase],
			update() {
				if (Timer.frozen
				 || GhsMgr.isFrightMode
				 || Game.interval*(++time) < list[idx])
					return
				[time,phase.mode] = [0,(++idx % 2)]
				queueDirectionReverse()
			}
		};return phase.mode? initPhase(CHACE) : phase
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
		;(player.timeSinceLastEating >= timeout)
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
		const idx = Ghosts.findIndex(g=> g.state.isIdle)
		idx != -1 && personalCounters[idx]++
	}
	State .on({_Ready:reset})
	Player.on({AteDot:increaseCounter})
	return {releaseIfReady}
}()

const CruiseElroy = function() {
	let  _part = 0
	const Accelerations = freeze([1.00, 1.02, 1.05, 1.1])
	const DotsLeftTable = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
	function angry() {
		return State.isInGame
			&& _part > 1
			&& Ghosts[GhsType.Akabei]?.frightened == false
			&& Ghosts[GhsType.Guzuta]?.started == true
	}
	function onDotEaten() {
		const rate = [1.5, 1.0, 0.5][_part]
		if (Maze.dotsLeft <= DotsLeftTable[Game.clampedLv-1]*rate)
			++_part && Sound.playSiren()
	}
	State .on({_NewLevel:()=> _part=0})
	Player.on({AteDot:onDotEaten})
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
		#time=0; #flash=0; #caught=0; #fIdx=1;
		get score()     {return PtsLst[this.#caught-1]}
		get caughtAll() {return this.#caught == GhsType.Max}
		get spriteIdx() {return this.#flash && this.#fIdx^1}
		constructor() {
			queueDirectionReverse()
			this.Dur = TimeTable[Game.clampedLv-1]
			this.Dur == 0 && !State.isAttract
				? $(Ghosts).trigger('FleeTime')
				: this.#set(true)
		}
		#set(/**@type {boolean}*/isOn) {
			_session = (isOn? this:null)
			$(Ghosts)
				.trigger('FrightMode',isOn)
				.offon('Bitten',()=> this.#caught++,isOn)
			Sound.toggleFrightMode(isOn)
		}
		#flashing() {
			const iv = (this.Dur == 1 ? 12:14)/Game.speed|0
			this.#fIdx ^= +(this.#flash++ % iv == 0)
		}
		update() {
			if (State.isInGame && !Timer.frozen) {
				const et = (this.#time++ * Game.interval)/1000
				;(et>=this.Dur-2) && this.#flashing()
				;(et>=this.Dur || this.caughtAll) && this.#set(false)
			}
 		}
	}
	GhsMgr.on({Init:()=> _session=null})
	return {
		new() {new Session},
		get session() {return _session},
	}
}()
import {Sound}   from '../../_snd/sound.js'
import {AState}  from '../../_lib/state.js'
import {Game}    from '../_main.js'
import {GhsSpd}  from '../speed.js'
import {State}   from '../state.js'
import {Cfg}     from '../env.js'
import {Maze}    from '../maze.js'
import {PtsMgr}  from '../points.js'
import {Paths}   from './paths.js'
import {Targets} from './targets.js'
import {Ghost,player,onPlayerDotEaten} from '../actors.js'

const GhostList = /**@type {Ghost[]}*/([])

export {Paths,PtsMgr,GhsSpd as Spd}
export const Evt = asEnum('Ready','RoundEnds','Reverse','Frighten','FleeStart')

/** The fleeing time(ms) from the player when Frightened Time is 0. */
export const FLEE_TIME = 400

/** Ghost collision radii by state. */
export const HitRadii = /**@type {GhostHitRadii}*/([T*.50, T*.55])

/**
 When always chase mode,
 standby delay(ms) before the ghost leaves from the house.
*/
const StandbyDelays = /**@type {const}*/
([// Pinky->Aosuke->Guzuta
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

export const [StateType,createState] = function() {
	const States = /**@type {const}*/
		(['Idle','GoingOut','Walking','Bitten','Escaping','Entering'])
	/**
	 @typedef {typeof States[number]} StateType
	 @typedef {StateDef.Fluent<State,StateType>} IState
	 @extends {AState<StateType,States,Ghost>}
	*/
	class State extends AState {
		constructor(/**@type {Ghost}*/g) {
			super(g, States, {immediately:true})
			this.set(g.inHouse? 'Idle':'Walking')
		}
		get isEyes() {return this.is('Escaping','Entering')}
	}
	return [
		asEnum(...States),
		/**@type {(g:Ghost)=> IState}*/(g=> new State(g))
	]
}()

export const Points = {
	get type()  {return PointType.Ghost},
	get value() {return Fright.ptsValue},
}

export const Ghosts = new class GhostGroup {
	static {$(this.setup)}
	static setup() {
		State.on({
			InGame:    Ghosts.#onInGame,
			Ready:     Ghosts.#trigger,
			RoundEnds: Ghosts.#trigger,
		})
	}
	#animIdx = 0
	get animIndex()     {return this.#animIdx}
	get CruiseElroy()   {return CruiseElroy}
	get spriteIdx()     {return Fright.session?.spriteIdx ?? 0}
	get caughtAll()     {return Fright.session?.caughtAll ?? false}
	get isFrightened()  {return Fright.session != null}
	get isChasing()     {return PhaseManager.mode == CHASING}
	get isScattering()  {return PhaseManager.mode == SCATTER}
	get isAnyEscaping() {return GhostList.some(g=> g.isEscaping)}

	/** @param {Ghost[]} [ghostList] */
	initialize(ghostList) {
		this.#animIdx = GhostList.length = 0
		ghostList?.forEach((g,i)=> GhostList[i] = g)
	}
	#trigger() {
		$(GhostList).trigger(State.current)
	}
	#onInGame = ()=> {
		Sound.playSiren()
		Cfg.alwaysChase && this.#setReleaseTimer()
	}
	#setReleaseTimer() {
		const lv = (Game.pacDied? 0 : Game.clampedLv)
		Timer.sequence(.../**@type {TimerSeq[]}*/(
			GhostList.slice(1).map((g,i)=> [
				StandbyDelays[lv][i]/Game.speed,
				()=> g.leaveHouse()
			]))
		)
	}
	frighten() {
		signalDirectionReversal()
		Fright.frighten()
	}
	update() {
		Fright.session?.update()
		PhaseManager.update()
		this.#updateAnimation()
		this.#updateGhosts()
	}
	#updateAnimation() {
		if (Timer.frozen)
			return
		if (State.isInGame
		 || State.isDemoMode)
			this.#animIdx ^= +(Ticker.count % 6 == 0)
	}
	#updateGhosts() {
		GhostList.forEach(g=> g.update())
		Paths.update(GhostList)
	}
	drawBehind() {
		this.#draw(false)
	}
	drawFront()  {
		Targets.draw(GhostList)
		Paths.draw(GhostList)
		this.#draw(true)
		PtsMgr.drawGhostPts()
	}
	#draw(onFront=true) {
		GhostList.forEach((_,i,arr)=> {
			const g = arr[arr.length-1-i]
			if (g.state.isBitten) return
			if (g.isFrightened == onFront) return
			g.draw()
		})
	}
	/** @param {GhostIdx} type */
	of = type=> GhostList[type]
}

const SCATTER = 0
const CHASING = 1
const signalDirectionReversal = ()=> {
	$(GhostList).trigger(Evt.Reverse)
}
const PhaseManager = function() {
	function create(lv=1) {
		let tCnt = -1, idx = 0
		let mode = Cfg.alwaysChase? CHASING : SCATTER
		const list = /**@type {const}*/([
			{mode:SCATTER, dur:lv <= 4 ? 4500 : 4000},
			{mode:CHASING, dur:15e3},
			{mode:SCATTER, dur:lv <= 4 ? 4500 : 4000},
			{mode:CHASING, dur:15e3},
			{mode:SCATTER, dur:3500},
			{mode:CHASING, dur:lv == 1 ? 15e3 : 78e4},
			{mode:SCATTER, dur:lv == 1 ? 3500 : 0},
			{mode:CHASING, dur:Infinity},
		]),
		update = (mode == CHASING)
			? null
			: ()=> {
				if (Timer.frozen || Ghosts.isFrightened)  return
				if (++tCnt*Game.interval < list[idx].dur) return
				signalDirectionReversal()
				++idx,(!list[idx].dur && ++idx)
				tCnt = 0, mode = list[idx].mode
			}
		return {get mode(){return mode},update}
	}
	let phase = create()
	State.on({_Ready(){phase = create(Game.level)}})
	return {
		get mode() {return phase.mode},
		update() {State.isInGame && phase.update?.()},
	}
}()

export const DotCounter = function() {
	let   gCounter   = -1
	const pCounters  = new Uint8Array(GhostType.Max)
	const LimitTable = /**@type {const}*/
		(// global,lv1,lv2,lv3+
			[[ 7,  0,  0, 0], // Pinky
			 [17, 30,  0, 0], // Aosuke
			 [32, 60, 50, 0]] // Guzuta
		)
	function reset() {
		!Game.pacDied && pCounters.fill(0)
		gCounter = Game.pacDied? 0:-1
	}
	/** @param {Ghost} ghost */
	function releaseIfReady({type,leaveHouse}) {
		const index   = min(Game.level,3)
		const timeout = (Game.level<=4 ? 4e3:3e3)
		const gLimit  = LimitTable[type-1][0]
		const pLimit  = LimitTable[type-1][index]
		;(player.timeSinceLastEating >= timeout)
			? leaveHouse()
			: (!Game.pacDied || gCounter < 0)
				? (pCounters[type] >= pLimit)
					&& leaveHouse()
				: (gCounter == gLimit)
					&& leaveHouse(type == GhostType.Guzuta)
					&& (gCounter = -1)
	}
	function incPreferredGhostCounter() {
		const
		idx = GhostList.findIndex(g=> g.state.isIdle)
		idx != -1 && pCounters[idx]++
	}
	onPlayerDotEaten(()=> {
		(Game.pacDied && gCounter >= 0)
			? gCounter++
			: incPreferredGhostCounter()
	})
	State.on({_Ready:reset})
	return {releaseIfReady}
}()

const CruiseElroy = function() {
	let   currentPart   = 0
	const Accelerations = freeze([1.00, 1.02, 1.05, 1.1])
	const DotsLeftTable = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
	function angry() {
		return State.isInGame
			&& currentPart > 1
			&& GhostList[GhostType.Akabei]?.isFrightened == false
			&& GhostList[GhostType.Guzuta]?.isStarted == true
	}
	onPlayerDotEaten(()=> {
		const rate = [1.5, 1.0, 0.5][currentPart]
		if (Maze.dotsLeft <= DotsLeftTable[Game.clampedLv-1]*rate)
			++currentPart && Sound.playSiren()
	})
	State.on({_NewLevel(){currentPart = 0}})
	return {
		get part()  {return currentPart},
		get angry() {return angry()},
		get speed() {return GhsSpd.Base * Accelerations[currentPart]},
	}
}()

const Fright = function() {
	let   session = /**@type {?Readonly<Session>}*/(null)
	const PtsList = /**@type {const}*/([200,400,800,1600])
	const DurList = /**@type {const}*/([6,5,4,3,2,5,2,2,1,5,2,1,0]) // secs
	class Session {
		#et=0; #caught=0; #fCnt=0; #sIdx=1; iv; dur;
		get points()    {return PtsList[this.#caught-1]}
		get spriteIdx() {return this.#sIdx ^ 1}
		get caughtAll() {return this.#caught == GhostType.Max}
		constructor(s=0) {
			this.iv = ((this.dur = s) == 1 ? 12:14) / Game.speed
			!s ? $(GhostList).trigger(Evt.FleeStart) : this.#set()
		}
		#set(isOn=true) {
			session = (isOn? this : null)
			$(GhostList)
				.trigger(Evt.Frighten, isOn)
				.offon(StateType.Bitten, ()=> this.#caught++, isOn)
			Sound.toggleFrightMode(isOn)
		}
		update() {
			if (State.isInGame && !Timer.frozen) {
				const {dur,iv}= this
				const et = (this.#et += Game.interval) / 1000
				if (et >= dur-2) this.#sIdx ^= +!(this.#fCnt++ % iv)
				if (et >= dur+0 || this.caughtAll) this.#set(false)
			}
 		}
	}
	State.on({_Ready(){session = null}})
	return {
		frighten() {new Session(DurList[Game.clampedLv-1])},
		get session()  {return session},
		get ptsValue() {return session?.points ?? PtsList[0]},
	}
}()
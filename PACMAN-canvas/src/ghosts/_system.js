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
export const Events = asEnum('Ready','RoundEnds','Reverse','Frighten','FleeStart')

/** The fleeing time(ms) from the player when Frightened Time is 0. */
export const FLEE_TIME = 500

/** Ghost collision radii by state. */
export const HitRadii = /**@type {GhostHitRadii}*/([T*.40, T*.55])

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

export const Points = {
	get type()  {return PointType.Ghost},
	get value() {return Fright.ptsValue},
}

export const Ghosts = new class GhostGroup {
	static {$(this.setup)}
	static setup() {
		State.on({InGame:Ghosts.#onInGame})
		State.onChange(Ghosts.#dispatchState)
	}
	#animIdx = 0
	get animIndex()     {return Ghosts.#animIdx}
	get CruiseElroy()   {return CruiseElroy}
	get spriteIdx()     {return Fright.session?.spriteIdx ?? 0}
	get caughtAll()     {return Fright.session?.caughtAll ?? false}
	get isFrightened()  {return Fright.session != null}
	get isChasing()     {return PhaseManager.mode == CHASING}
	get isScattering()  {return PhaseManager.mode == SCATTER}
	get isAnyEscaping() {return GhostList.some(g=> g.isEscaping)}

	/** @param {Ghost[]} [ghostList] */
	initialize(ghostList) {
		Ghosts.#animIdx = GhostList.length = 0
		ghostList?.forEach((g,i)=> GhostList[i] = g)
	}
	#onInGame() {
		Sound.playSiren()
		Cfg.alwaysChase && Ghosts.#setReleaseTimer()
	}
	#dispatchState() {
		hasOwn(Events,State.current)
			&& $(GhostList).trigger(State.current)
	}
	#setReleaseTimer() {
		const lv = (Game.pacDied? 0 : Game.clampedLv)
		Timer.sequence(...
			GhostList.slice(1).map((g,i)=> /**@type {TimerSeq}*/
				([StandbyDelays[lv][i]/Game.speed, g.leaveHouse])
			)
		)
	}
	frighten() {
		signalDirectionReversal()
		Fright.frighten()
	}
	update() {
		Fright.session?.update()
		PhaseManager.update()
		Ghosts.#updateAnimation()
		Ghosts.#updateGhosts()
	}
	#updateAnimation() {
		if (Timer.frozen)
			return
		if (State.isInGame
		 || State.isDemoMode)
			Ghosts.#animIdx ^= +(Ticker.count % 6 == 0)
	}
	#updateGhosts() {
		GhostList.forEach(g=> g.update())
		Paths.update(GhostList)
	}
	drawBehind() {
		Ghosts.#draw(false)
	}
	drawFront()  {
		Targets.draw(GhostList)
		Paths.draw(GhostList)
		Ghosts.#draw(true)
		PtsMgr.drawGhostPts()
	}
	#draw(onFront=true) {
		GhostList
			.toReversed()
			.forEach(g=> {
				g.isFrightened != onFront && g.draw()
			})
	}
	/** @param {GhostType} idx */
	of = idx=> GhostList[idx]
}

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

const SCATTER = 0
const CHASING = 1
const signalDirectionReversal = ()=> {
	$(GhostList).trigger(Events.Reverse)
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
	let   session = /**@type {?ReturnType<typeof on>}*/(null)
	const PtsList = /**@type {const}*/([200,400,800,1600])
	const DurList = /**@type {const}*/([6,5,4,3,2,5,2,2,1,5,2,1,0]) // secs
	function on(tmr=0) {
		let sprIdx=1, flash=0, caught=0
		const iv  = (tmr == 1 ? 12:14) / Game.speed
		const set = (isOn=true)=> {
			!isOn && (session = null)
			$(GhostList)
				.trigger(Events.Frighten, isOn)
				.offon(StateType.Bitten, ()=> caught++, isOn)
			Sound.toggleFrightMode(isOn)
		}
		tmr? set(true) : $(GhostList).trigger(Events.FleeStart)
		return {
			get points()    {return PtsList[caught-1]},
			get spriteIdx() {return sprIdx ^ 1},
			get caughtAll() {return caught == GhostType.Max},
			update() {
				if (!State.isInGame || Timer.frozen) return
				tmr -= Game.interval/1e3
				if (tmr <= 2) sprIdx ^= +!(flash++ % iv)
				if (tmr <= 0 || this.caughtAll) set(false)
			},
		}
	}
	State.on({_Ready(){session = null}})
	return {
		frighten() {session = on(DurList[Game.clampedLv-1])},
		get session()  {return session},
		get ptsValue() {return session?.points ?? PtsList[0]},
	}
}()
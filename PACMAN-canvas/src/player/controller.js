import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js';
import {GhsMgr}  from '../ghosts/_system.js'

const Spd = PacSpeed, {SlowLevel,SlowRate}= Spd

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover {
	/** @private */actor
	/** @private */state
	#speed  = 0
	#onWall = false
	constructor(/**@type {Actor}*/actor) {
		this.actor = actor
		this.state = new TurnState
		setSteerEvent({actor,state:this.state})
	}
	get speed()  {return this.#speed ||= this.#tileSpeed}
	get onWall() {return this.#onWall}
	get canMove() {
		const {state:s,actor:a}= this
		return s.turning || !a.collidesWithWall()
	}
	get #canTurn() {
		const {actor:a,state:{nextDir}}=this
		return nextDir != null
		    && !a.passedTileCenter
		    && !a.collidesWithWall(nextDir)
	}
	get #tileSpeed() {
		const slowRate = (Game.level<SlowLevel ? 1:SlowRate)
		return (
			Game.moveSpeed * slowRate * (
			  Maze.hasDot(this.actor.tileIdx)
			    ?(GhsMgr.isFrightMode? Spd.EneEating : Spd.Eating)
			    :(GhsMgr.isFrightMode? Spd.Energized : Spd.Base)
			)
		)
	}
	/** @param {number} spd */
	update(spd) {
		this.#turnCorner(spd)
		this.actor.setNextPos(spd)
		this.#setMoveSpeed(spd)
		this.#finishCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	/** @param {number} spd */
	#setMoveSpeed(spd) {
		if (this.actor.justArrivedAtTile(spd))
			this.#speed = this.#tileSpeed
	}
	/** @param {number} spd */
	#turnCorner(spd) {
		const {state:s,actor:a}= this
		if (this.#canTurn && s.nextDir) {
			s.turning ||= true
			a.orient = s.nextDir
			a.setNextPos(spd, s.nextDir)
		}
	}
	#finishCornering() {
		const {state:s,actor:a}= this
		if (s.turning && a.passedTileCenter) {
			s.nextDir  = s.nextTurn
			s.turning  = false
			s.nextTurn = null
			a.setMoveDir(a.orient)
		}
	}
	#turnAround() {
		const {actor:a}= this
		if (a.dir == a.revOrient) {
			a.setMoveDir(a.orient)
			this.#speed = this.#tileSpeed
		}
	}
	#stopAtWall() {
		const {state:s,actor:a,canMove}= this
		if (!canMove) {
			a.pos = a.tilePos.mul(T)
			s.nextDir = null
		} this.#onWall = !canMove
	}
}

/** @param {{actor:Actor, state:TurnState}} _ */
function setSteerEvent({actor,state}) {
	$win.offon('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || dir == null
		 || Confirm.opened
		 || Ctrl.activeElem
		) return

		if (state.turning)
			return void(state.nextTurn = dir)

		if (actor.hasAdjWall(dir))
			return void(state.nextDir = dir)

		if (State.isStartMode && Vec2[dir].x)
			return void(actor.dir = dir)

		state.nextDir = dir
		if (actor.passedTileCenter) {
			actor.orient = dir
			actor.setMoveDir(actor.revDir)
		}
	})
}
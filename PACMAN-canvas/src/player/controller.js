import {Dir}      from '../../_lib/direction.js';
import {Game}     from '../_main.js'
import  Speed     from '../speed.js';
import {State}    from '../state.js'
import {Ctrl}     from '../control.js';
import {Actor}    from '../actor.js';
import {Maze}     from '../maze.js'
import {GhostMgr} from '../ghosts/_system.js'

const {Pacman:Spd}= Speed

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover {
	/** @private @readonly */actor
	/** @private @readonly */state
	/** @param {Actor} actor */
	constructor(actor) {
		this.actor = actor
		this.state = new TurnState
		setSteerEvent(actor,this.state)
	}
	#spd = /**@type {?number}*/(null)
	get speed() {
		return this.#spd ??= this.#setSpeed()
	}
	get onWall() {
		const  {state,actor}= this
		return !state.turning && actor.collidesWithWall()
	}
	get canTurn() {
		const {actor,state:{nextDir}}=this
		return nextDir != null
		    && !actor.passedTileCenter
		    && !actor.collidesWithWall(nextDir)
	}
	#setSpeed() {
		const spd = Maze.hasDot(this.actor.tileIdx)
			? (GhostMgr.isFrightMode? Spd.EneEating : Spd.Eating)
			: (GhostMgr.isFrightMode? Spd.Energized : Spd.Base)
		return(this.#spd = Game.moveSpeed * Spd.levelFactor * spd)
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
			this.#setSpeed()
	}
	/** @param {number} spd */
	#turnCorner(spd) {
		const {state,actor}= this
		if (this.canTurn && state.nextDir) {
			state.turning ||= true
			actor.orient = state.nextDir
			actor.setNextPos(spd, state.nextDir)
		}
	}
	#finishCornering() {
		const {state,actor}= this
		if (state.turning && actor.passedTileCenter) {
			state.nextDir  = state.nextTurn
			state.turning  = false
			state.nextTurn = null
			actor.setMoveDir(actor.orient)
		}
	}
	#turnAround() {
		const {actor}= this
		if (actor.dir == actor.revOrient) {
			actor.setMoveDir(actor.orient)
			this.#setSpeed()
		}
	}
	#stopAtWall() {
		const {state,actor}= this
		if (this.onWall) {
			actor.pos = actor.tile.mul(T)
			state.nextDir = null
		}
	}
}

/**
 @param {Actor} actor
 @param {TurnState} state
*/
function setSteerEvent(actor,state) {
	$win.offon('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (!dir || keyRepeat(e) || Ctrl.isCaptured)
			return

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
import {Dir}   from '../../_lib/direction.js';
import {Game}  from '../_main.js'
import {State} from '../state.js'
import {Env}   from '../control.js';
import {Maze}  from '../maze.js'
import {Actor,Ghosts}  from '../actors.js';
import {PacSpd as Spd} from '../speed.js';

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
			? (Ghosts.isFrightened? Spd.EneEating : Spd.Eating)
			: (Ghosts.isFrightened? Spd.Energized : Spd.Base)
		return(this.#spd = Game.moveSpeed * Spd.levelFactor * spd)
	}
	/**
	 @param {number} spd
	 @returns {boolean} True if the actor stopped at a wall.
	*/
	update(spd) {
		this.#turnCorner(spd)
		this.actor.setNextPosition(spd)
		this.#setMoveSpeed(spd)
		this.#finishCornering()
		this.#turnAround()
		return this.#stopAtWall()
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
			actor.setNextPosition(spd, state.nextDir)
		}
	}
	#finishCornering() {
		const {state,actor}= this
		if (state.turning && actor.passedTileCenter) {
			state.nextDir  = state.nextTurn
			state.nextTurn = null
			state.turning  = false
			actor.updateDirection()
		}
	}
	#turnAround() {
		const {actor}= this
		if (actor.dir == actor.revOrient) {
			actor.updateDirection()
			this.#setSpeed()
		}
	}
	#stopAtWall() {
		const {state,actor}= this
		if (this.onWall) {
			actor.pos = actor.tile.mul(T)
			state.nextDir = null
			return true
		}
		return false
	}
}

/**
 @param {Actor} actor
 @param {TurnState} state
*/
function setSteerEvent(actor,state) {
	$win.offon('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (!dir || keyRepeated(e) || Env.isCaptured)
			return

		if (!State.isInGame && Vec2[dir].x)
			return void(actor.dir = dir)

		if (state.turning)
			return void(state.nextTurn = dir)

		if (actor.hasAdjacentWall(dir))
			return void(state.nextDir = dir)

		state.nextDir = dir
		if (actor.passedTileCenter) {
			actor.orient = dir
			actor.updateDirection(actor.revDir)
		}
	})
}
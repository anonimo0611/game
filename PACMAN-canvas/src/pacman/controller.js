import {Dir}    from '../../_lib/direction.js';
import {Game}   from '../_main.js'
import  Speed   from '../speed.js';
import {State}  from '../state.js'
import {Ctrl}   from '../control.js';
import {Maze}   from '../maze.js'
import {Ghosts} from '../actors.js';
import {pActor as actor} from './pacman.js';

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}

const {Pacman:Spd}= Speed
let state = new TurnState()

export class Mover {
	constructor() {state = new TurnState()}
	#spd = /**@type {?number}*/(null)
	get speed() {
		return this.#spd ??= this.#setSpeed()
	}
	get onWall() {
		return !state.turning && actor.collidesWithWall()
	}
	get canTurn() {
		return state.nextDir != null
		    && !actor.passedTileCenter
		    && !actor.collidesWithWall(state.nextDir)
	}
	#setSpeed() {
		if (!actor) return 0
		const spd = Maze.hasDot(actor.tileIdx)
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
		actor.setNextPosition(spd)
		this.#setMoveSpeed(spd)
		this.#finishCornering()
		this.#turnAround()
		return this.#stopAtWall()
	}
	/** @param {number} spd */
	#setMoveSpeed(spd) {
		if (actor.justArrivedAtTile(spd))
			this.#setSpeed()
	}
	/** @param {number} spd */
	#turnCorner(spd) {
		if (this.canTurn && state.nextDir) {
			state.turning ||= true
			actor.orient = state.nextDir
			actor.setNextPosition(spd, state.nextDir)
		}
	}
	#finishCornering() {
		if (state.turning && actor?.passedTileCenter) {
			state.nextDir  = state.nextTurn
			state.turning  = false
			state.nextTurn = null
			actor.updateDirection()
		}
	}
	#turnAround() {
		if (actor.dir == actor.revOrient) {
			actor.updateDirection()
			this.#setSpeed()
		}
	}
	#stopAtWall() {
		if (this.onWall) {
			actor.pos = actor.tile.mul(T)
			state.nextDir = null
			return true
		}
		return false
	}
}

$win.on('keydown.PacSteer', e=> {
	const dir = Dir.from(e,{wasd:true})
	if (!dir || keyRepeat(e) || Ctrl.isCaptured)
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
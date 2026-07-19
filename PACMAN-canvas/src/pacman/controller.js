import {Dir}   from '../../_lib/direction.js';
import {Game}  from '../_main.js'
import {State} from '../state.js'
import {Env}   from '../env.js';
import {Maze}  from '../maze.js'
import {Actor,Ghosts}  from '../actors.js';
import {PacSpd as Spd} from '../speed.js';

export class Mover {
	#actor
	#turning  = false
	#nextDir  = /**@type {?Direction}*/(null)
	#nextTurn = /**@type {?Direction}*/(null)

	/** @param {Actor} actor */
	constructor(actor) {
		Mover.#setSteerEvent(this, this.#actor=actor)
	}
	#spd = /**@type {?number}*/(null)
	get speed() {
		return this.#spd ??= this.#setSpeed()
	}
	get onWall() {
		return this.#turning == false
			&& this.#actor.collidesWithWall()
	}
	get canTurn() {
		return !this.#actor.passedTileCenter
			&& !this.#actor.collidesWithWall(this.#nextDir)
	}
	#setSpeed() {
		const spd = Maze.hasDot(this.#actor.tileIdx)
			? (Ghosts.isFrightened? Spd.EneEating : Spd.Eating)
			: (Ghosts.isFrightened? Spd.Energized : Spd.Base)
		return(this.#spd = Game.moveSpeed * Spd.levelFactor * spd)
	}
	/**
	 @param {number} step
	 @returns {boolean} True if the actor stopped at a wall.
	*/
	update(step) {
		this.#turnCorner(step)
		this.#actor.setNextPosition(step)
		this.#adjustSpeedOnTileArrival(step)
		this.#finishCornering()
		return this.#stopAtWall()
	}
	/** @param {number} step */
	#adjustSpeedOnTileArrival(step) {
		if (this.#actor.justArrivedAtTile(step))
			this.#setSpeed()
	}
	/** @param {number} step */
	#turnCorner(step) {
		if (this.#nextDir && this.canTurn) {
			this.#turning ||= true
			this.#actor.orient = this.#nextDir
			this.#actor.setNextPosition(step, this.#nextDir)
		}
	}
	#finishCornering() {
		if (this.#turning && this.#actor.passedTileCenter) {
			this.#nextDir  = this.#nextTurn
			this.#nextTurn = null
			this.#turning  = false
			this.#actor.alignDirection()
		}
	}
	#stopAtWall() {
		if (this.onWall) {
			this.#nextDir = null
			this.#actor.snapToTileCenter()
			return true
		}
		return false
	}
	/**
	 @param {Mover} mover
	 @param {Actor} actor
	*/
	static #setSteerEvent(mover, actor) {
		$win.offon('keydown.PacSteer', e=> {
			const dir = Dir.from(e, {wasd:true})
			if (keyRepeated(e) || Env.isCaptured)   return
			if (dir == null || dir == actor.orient) return

			if (!State.isInGame && Vec2[dir].x) {
				return void(actor.dir = dir)
			}
			if (mover.#turning) {
				return void(mover.#nextTurn = dir)
			}
			if (actor.hasAdjacentWall(dir)) {
				return void(mover.#nextDir = dir)
			}
			if (dir == actor.revDir) {
				actor.dir = dir
				mover.#nextDir = null
				mover.#setSpeed()
				return
			}
			mover.#nextDir = dir
			if (actor.passedTileCenter) {
				actor.orient = dir
				actor.alignDirection(actor.revDir)
			}
		})
	}
}
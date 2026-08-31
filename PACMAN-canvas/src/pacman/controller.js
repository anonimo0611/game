import {Dir}   from '../../_lib/direction.js'
import {Game}  from '../_main.js'
import {State} from '../state.js'
import {Env}   from '../env.js'
import {Maze}  from '../maze.js'
import {Actor,Ghosts}  from '../actors.js'
import {PacSpd as Spd} from '../speed.js'

export class Mover {
	#turning  = false
	#nextDir  = /**@type {?Direction}*/(null)
	#nextTurn = /**@type {?Direction}*/(null)

	/** @private @readonly */a
	/** @param {Actor} actor */
	constructor(actor) {
		Mover.#setSteerEvent(this, this.a=actor)
	}
	#spd = /**@type {?number}*/(null)
	get speed() {
		return this.#spd ??= this.#setSpeed()
	}
	get onWall() {
		return !this.#turning && this.a.collidesWithWall()
	}
	get canTurn() {
		return (this.#nextDir && !this.a.passedTileCenter)
		    && !this.a.collidesWithWall(this.#nextDir)
			&& Vec2[this.a.dir].cross(Vec2[this.#nextDir]) != 0
	}
	#setSpeed() {
		const spd = Maze.hasDot(this.a.tileIdx)
			? (Ghosts.isFrightened? Spd.EneEating : Spd.Eating)
			: (Ghosts.isFrightened? Spd.Energized : Spd.Base)
		return(this.#spd = Game.moveSpeed * Spd.levelFactor * spd)
	}
	/**
	 @param {number} step
	 @returns {boolean} True if the actor stopped at a wall.
	*/
	update(step) {
		this.#turnAround()
		this.#turnCorner(step)
		this.a.setNextPosition(step)
		this.#adjustSpeedOnTileArrival(step)
		this.#finishCornering()
		return this.#stopAtWall()
	}
	#turnAround() {
		if (this.a.dir == this.a.revOrient) {
			this.a.alignDirection()
			this.#setSpeed()
		}
	}
	/** @param {number} step */
	#adjustSpeedOnTileArrival(step) {
		if (this.a.justArrivedAtTile(step))
			this.#setSpeed()
	}
	/** @param {number} step */
	#turnCorner(step) {
		if (this.canTurn && this.#nextDir) {
			this.#turning ||= true
			this.a.orient = this.#nextDir
			this.a.setNextPosition(step, this.#nextDir)
		}
	}
	#finishCornering() {
		if (this.#turning && this.a.passedTileCenter) {
			this.#nextDir  = this.#nextTurn
			this.#turning  = false
			this.#nextTurn = null
			this.a.alignDirection()
		}
	}
	#stopAtWall() {
		if (this.onWall) {
			this.a.snapToTileCenter()
			this.#nextDir = null
			return true
		}
		return false
	}
	/**
	 @param {Mover} mover
	 @param {Actor} actor
	*/
	static #setSteerEvent(mover,actor) {
		$win.offon('keydown.PacSteer', e=> {
			const dir = Dir.from(e,{wasd:true})
			if (!dir || keyRepeated(e) || Env.isCaptured)
				return

			if (!State.isInGame && Vec2[dir].x)
				return void(actor.dir = dir)

			if (mover.#turning)
				return void(mover.#nextTurn = dir)

			if (actor.hasAdjacentWall(dir))
				return void(mover.#nextDir = dir)

			mover.#nextDir = actor.orient = dir
			if (actor.passedTileCenter)
				actor.alignDirection(actor.revDir)
		})
	}
}
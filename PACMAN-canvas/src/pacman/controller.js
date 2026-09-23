import {Dir}   from '../../_lib/direction.js'
import {Game}  from '../_main.js'
import {State} from '../state.js'
import {Env}   from '../env.js'
import {Maze}  from '../maze.js'
import {Actor,Ghosts}  from '../actors.js'
import {PacSpd as Spd} from '../speed.js'

/** @param {Actor} actor */
export function createMover(actor) {
	let _speed   = 0
	let turning  = false
	let nextDir  = /**@type {?Direction}*/(null)
	let nextTurn = /**@type {?Direction}*/(null)

	function onWall() {
		return !turning && actor.collidesWithWall()
	}

	function canTurn() {
		return (nextDir && !actor.passedTileCenter)
		    && !actor.collidesWithWall(nextDir)
	}

	function turnAround() {
		if (actor.dir == actor.revOrient) {
			actor.alignDir()
			_speed = getSpeed()
		}
	}

	/** @param {number} step */
	function setTileSpeed(step) {
		if (actor.justArrivedAtTile(step))
			_speed = getSpeed()
	}

	/** @param {number} step */
	function turnCorner(step) {
		if (canTurn() && nextDir) {
			turning ||= true
			actor.orient = nextDir
			actor.setNextPos(step, nextDir)
		}
	}

	function finishCornering() {
		if (turning && actor.passedTileCenter) {
			turning  = false
			nextDir  = nextTurn
			nextTurn = null
			actor.alignDir()
		}
	}

	function stopAtWall() {
		if (onWall()) {
			nextDir = null
			actor.snapToTileCenter()
			return true
		}
		return false
	}

	const getSpeed = ()=>
		Game.moveSpeed * Spd.levelFactor * (
			Maze.hasDot(actor.tileIdx)
			? (Ghosts.isFrightened? Spd.EneEating : Spd.Eating)
			: (Ghosts.isFrightened? Spd.Energized : Spd.Base)
		)

	$win.offon('keydown.PacSteer', e=> {
		const dir = Dir.from(e, {wasd:true})
		if (dir == null || dir == actor.dir)  return
		if (keyRepeated(e) || Env.isCaptured) return

		if (!State.isInGame && Vec2[dir].x)
			return void(actor.dir = dir)

		if (turning)
			return void(nextTurn = dir)

		if (actor.hasAdjacentWall(dir))
			return void(nextDir = dir)

		actor.orient = dir
		nextDir = (dir == actor.revDir)? null : dir

		if (actor.passedTileCenter) {
			actor.setMoveDir(actor.revDir)
			actor.snapToAxis()
		}
	})

	return {
		/**
		 @param   {number}  step
		 @returns {boolean} True if the actor stopped at a wall.
		*/
		update(step) {
			turnAround()
			turnCorner(step)
			actor.setNextPos(step)
			setTileSpeed(step)
			finishCornering()
			return stopAtWall()
		},
		get speed()  {return _speed ||= getSpeed()},
		get onWall() {return onWall()},
	}
}
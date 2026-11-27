import {Dir}   from '@lib/direction.js'
import {Game}  from '@/_main.js'
import {State} from '@/state.js'
import {Env}   from '@/env.js'
import {Maze}  from '@/maze.js'
import {Actor,Ghosts}  from '@actors'
import {PacSpd as Spd} from '@/speed.js'

/** @param {Actor} actor */
export function createMover(actor) {
	let _speed   = 0
	let turning  = false
	let nextDir  = Dir.NULL
	let nextTurn = Dir.NULL

	function onWall() {
		return !turning && actor.collidesWithWall()
	}
	function canTurn() {
		return (nextDir && !actor.passedTileCenter)
		    && !actor.collidesWithWall(nextDir)
	}
	const getSpeed = ()=>
		Game.moveSpeed * Spd.levelFactor(Game.level) * (
			Maze.hasDot(actor.tile)
			? (Ghosts.isFrightened? Spd.EneEating : Spd.Eating)
			: (Ghosts.isFrightened? Spd.Energized : Spd.Base)
		)

	$win.offon('keydown.PacSteer', e=> {
		const dir = Dir.from(e, {wasd:true})
		if (!dir || keyRepeated(e) || Env.isCaptured)
			return

		if (!State.isInGame && Vec2[dir].x)
			return void (actor.dir = dir)

		if (turning)
			return void (nextTurn = dir)

		if (actor.hasAdjWall(dir))
			return void (nextDir = dir)

		actor.orient = dir
		nextDir = (dir == actor.revDir)? null : dir

		if (actor.passedTileCenter)
			actor.setMoveDir(actor.revDir)
	})

	/**
	 * @param   {number}  step
	 * @returns {boolean} True if the actor stopped at a wall.
	 */
	function update(step) {
		// turn around
		if (actor.dir == actor.revOrient) {
			actor.alignDir()
			_speed = getSpeed()
		}

		// turn corner
		if (canTurn() && nextDir) {
			turning ||= true
			actor.orient = nextDir
			actor.setNextPos(step, nextDir)
		}
		actor.setNextPos(step)

		// set tile speed
		if (actor.justArrivedAtTile(step)) {
			_speed = getSpeed()
		}

		// finish cornering
		if (turning && actor.passedTileCenter) {
			turning  = false
			nextDir  = nextTurn
			nextTurn = null
			actor.alignDir()
		}

		// stop at the wall
		if (onWall()) {
			nextDir = null
			actor.snapToTileCenter()
			return true
		}
		return false
	}
	return {
		get speed()  {return _speed ||= getSpeed()},
		get onWall() {return onWall()}, update,
	}
}
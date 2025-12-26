import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js';
import {GhsMgr}  from '../ghosts/_system.js'

const  Speed = PacSpeed
const {SlowLevel,SlowRate}= Speed

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover extends Actor {
	/** @private */
	state    = new TurnState
	#speed   = 0
	#stopped = true
	constructor(col=0,row=0) {
		super()
		this.pos.set(col*T, row*T)
		$win.off('keydown.PacSteer')
		setSteerEvent(this, this.state)
	}
	get speed()   {return this.#speed ||= this.tileSpeed}
	get stopped() {return this.#stopped}
	get canMove() {return this.state.turning || !this.collidesWithWall()}
	get canTurn() {
		return  this.state.nextDir != null
			&& !this.passedTileCenter
			&& !this.collidesWithWall(this.state.nextDir)
	}
	get tileSpeed() {
		return (
			 (Game.moveSpeed*(Game.level<SlowLevel ? 1:SlowRate))
			*(Maze.hasDot(this.tileIdx)
				? (GhsMgr.isFrightMode? Speed.EneEating:Speed.Eating)
				: (GhsMgr.isFrightMode? Speed.Energized:Speed.Base))
		)
	}
	#stopMove() {
		return (this.#stopped = !this.canMove)
	}
	/** @param {number} spd */
	update(spd) {
		this.#turnCorner(spd)
		this.setNextPos(spd)
		this.#setMoveSpeed(spd)
		this.#finishCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	/** @param {number} spd */
	#setMoveSpeed(spd) {
		if (this.justArrivedAtTile(spd))
			this.#speed = this.tileSpeed
	}
	/** @param {number} spd */
	#turnCorner(spd) {
		const dir = this.state.nextDir
		if (this.canTurn && dir) {
			this.state.turning ||= true
			this.orient = dir
			this.setNextPos(spd, dir)
		}
	}
	#finishCornering() {
		if (this.state.turning && this.passedTileCenter) {
			this.state.nextDir  = this.state.nextTurn
			this.state.nextTurn = null
			this.state.turning  = false
			this.setMoveDir(this.orient)
		}
	}
	#turnAround() {
		if (this.dir == this.revOrient)
			this.setMoveDir(this.orient)
	}
	#stopAtWall() {
		if (this.#stopMove()) {
			this.pos = this.tilePos.mul(T)
			this.state.nextDir = null
		}
	}
}

/**
 @param {Mover} move
 @param {TurnState} state
*/
function setSteerEvent(move, state) {
	$win.on('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || dir == null
		 || Confirm.opened
		 || Ctrl.activeElem
		) return

		if (state.turning)
			return void(state.nextTurn = dir)

		if (move.hasAdjWall(dir))
			return void(state.nextDir = dir)

		if (State.isStartMode && Vec2[dir].x)
			return void(move.dir = dir)

		state.nextDir = dir
		if (move.passedTileCenter) {
			move.orient = dir
			move.setMoveDir(move.revDir)
		}
	})
}
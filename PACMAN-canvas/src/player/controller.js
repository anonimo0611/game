import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js';
import {GhsMgr}  from '../ghosts/_system.js'

const Spd = PacSpeed
const{SlowLevel,SlowRate}= Spd

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover {
	/** @private */actor
	/** @private */state
	#speed   = 0
	#stopped = true
	constructor(/**@type {Actor}*/actor) {
		this.actor = actor
		this.state = new TurnState
		setSteerEvent(this.actor, this.state)
	}
	get speed()   {return this.#speed ||= this.#tileSpeed}
	get stopped() {return this.#stopped}
	get #canMove() {
		return  this.state.turning
		    || !this.actor.collidesWithWall()
	}
	get #canTurn() {
		const {nextDir}=this.state
		return nextDir != null
		    && !this.actor.passedTileCenter
		    && !this.actor.collidesWithWall(nextDir)
	}
	get #tileSpeed() {
		return (
			 (Game.moveSpeed*(Game.level<SlowLevel ? 1:SlowRate))
			*(Maze.hasDot(this.actor.tileIdx)
				? (GhsMgr.isFrightMode? Spd.EneEating:Spd.Eating)
				: (GhsMgr.isFrightMode? Spd.Energized:Spd.Base))
		)
	}
	#stopMove() {
		return (this.#stopped = !this.#canMove)
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
		const dir = this.state.nextDir
		if (this.#canTurn && dir) {
			this.state.turning ||= true
			this.actor.orient = dir
			this.actor.setNextPos(spd, dir)
		}
	}
	#finishCornering() {
		if (this.state.turning && this.actor.passedTileCenter) {
			this.state.nextDir  = this.state.nextTurn
			this.state.nextTurn = null
			this.state.turning  = false
			this.actor.setMoveDir(this.actor.orient)
		}
	}
	#turnAround() {
		if (this.actor.dir == this.actor.revOrient)
			this.actor.setMoveDir(this.actor.orient)
	}
	#stopAtWall() {
		if (this.#stopMove()) {
			this.state.nextDir = null
			this.actor.pos = this.actor.tilePos.mul(T)
		}
	}
}

/**
 @param {Actor} actor
 @param {TurnState} state
*/
function setSteerEvent(actor, state) {
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
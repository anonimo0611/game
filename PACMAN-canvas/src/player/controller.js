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
	#speed   = 0
	#stopped = true
	constructor(col=0,row=0) {
		super()
		/** @private */
		this.s = new TurnState
		this.pos.set(col*T, row*T)
		$win.off('keydown.PacSteer')
		setSteerEvent({m:this, s:this.s})
	}
	get speed()   {return this.#speed ||= this.tileSpeed}
	get stopped() {return this.#stopped}
	get canMove() {return this.s.turning || !this.collidesWithWall()}
	get canTurn() {
		return  this.s.nextDir != null
			&& !this.passedTileCenter
			&& !this.collidesWithWall(this.s.nextDir)
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
		const dir = this.s.nextDir
		if (this.canTurn && dir) {
			this.s.turning ||= true
			this.orient = dir
			this.setNextPos(spd, dir)
		}
	}
	#finishCornering() {
		if (this.s.turning && this.passedTileCenter) {
			this.s.nextDir  = this.s.nextTurn
			this.s.nextTurn = null
			this.s.turning  = false
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
			this.s.nextDir = null
		}
	}
}

/** @param {{s:TurnState,m:Mover}} param */
function setSteerEvent({s,m}) {
	$win.on('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || dir == null
		 || Confirm.opened
		 || Ctrl.activeElem
		) return

		if (s.turning) {
			s.nextTurn = dir
			return
		}
		if (m.hasAdjWall(dir)) {
			s.nextDir = dir
			return
		}
		if (State.isStartMode && Vec2[dir].x) {
			m.dir = dir
			return
		}
		s.nextDir = dir
		if (m.passedTileCenter) {
			m.orient = dir
			m.setMoveDir(m.revDir)
		}
	})
}
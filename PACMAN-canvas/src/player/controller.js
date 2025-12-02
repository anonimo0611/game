import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import { Actor } from '../actor.js';

const Speed = PacSpeed
const {SlowLevel,SlowRate}= Speed

class State {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover extends Actor {
	#speed   = 0
	#stopped = true

	get speed()   {return this.#speed}
	get stopped() {return this.#stopped}

	constructor() {
		super()
		/** @private */
		this.s = new State
		$win.off('keydown.PacSteer')
		setSteerEvent(this.s, this)
		$(()=> this.#speed = this.tileSpeed)
	}
	get canTurn() {
		return this.s.nextDir != null
			&& !this.passedTileCenter
			&& !this.collidesWithWall(this.s.nextDir)
	}
	get collidedWithWall() {
		return !this.s.turning && this.collidesWithWall()
	}
	get tileSpeed() {
		const eating = Maze.hasDot(this.tileIdx)
		return (
			GhsMgr.isFrightMode
			? (eating? Speed.EneEat : Speed.Energized)
			: (eating? Speed.Eating : Speed.Base)
		) * (Game.moveSpeed * (Game.level<SlowLevel ? 1:SlowRate))
	}
	#setMoveSpeed(divisor=1) {
		this.justArrivedAtTile(divisor)
			&& (this.#speed = this.tileSpeed)
	}
	update(divisor=1) {
		this.#turnCorner(divisor)
		this.setNextPos(divisor)
		this.#setMoveSpeed(divisor)
		this.#finishTurningCorner()
		this.#turnAround()
	}
	#turnCorner(divisor=1) {
		const dir = this.s.nextDir
		if (this.canTurn && dir) {
			this.s.turning ||= true
			this.orient = dir
			this.setNextPos(divisor, dir)
		}
	}
	#finishTurningCorner() {
		if (this.s.turning && this.passedTileCenter) {
			this.s.turning  = false
			this.s.nextDir  = this.s.nextTurn
			this.s.nextTurn = null
			this.setMoveDir(this.orient)
		}
	}
	#turnAround() {
		this.dir == this.revOrient
			&& this.setMoveDir(this.orient)
	}
	stopAtWall() {
		(this.#stopped = this.collidedWithWall)
			&& (this.pos = this.tilePos.mul(T))
			&& (this.s.nextDir = null)
	}
}

function setSteerEvent(
 /**@type {State}*/s,
 /**@type {Mover}*/m
) {
	$win.on('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
			|| dir == null
			|| Confirm.opened
			|| Ctrl.activeElem)
			return

		if (s.turning) {
			s.nextTurn = dir
			return
		}
		if (m.hasAdjWall(dir)) {
			s.nextDir = dir
			return
		}
		s.nextDir = dir
		if (m.passedTileCenter) {
			m.orient = dir
			m.setMoveDir(m.revDir)
		}
	})
}
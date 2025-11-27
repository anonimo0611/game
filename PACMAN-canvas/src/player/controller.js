import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import {pacman}  from './pacman.js';

const Speed = PacSpeed
const {SlowLevel,SlowRate}= Speed

class MoveState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
/** @param {MoveState} s */
function setSteerEvent(s) {
	$win.offon('keydown.Steer', e=> {
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
		if (pacman.hasAdjWall(dir)) {
			s.nextDir = dir
			return
		}
		s.nextDir = dir
		if (pacman.passedTileCenter) {
			pacman.orient = dir
			pacman.setMoveDir(pacman.revDir)
		}
	})
}
export class Mover {
	#speed   = 0
	#stopped = true
	constructor() {
		/** @private */
		this.s = new MoveState
		setSteerEvent(this.s)
		$(()=> this.#speed = this.tileSpeed)
	}
	get speed()   {return this.#speed}
	get stopped() {return this.#stopped}

	get canTurn() {
		return this.s.nextDir != null
			&& !pacman.passedTileCenter
			&& !pacman.collidesWithWall(this.s.nextDir)
	}
	get collidedWithWall() {
		return !this.s.turning && pacman.collidesWithWall()
	}
	get tileSpeed() {
		const eating = Maze.hasDot(pacman.tileIdx)
		return (
			GhsMgr.isFrightMode
			? (eating? Speed.EneEat : Speed.Energized)
			: (eating? Speed.Eating : Speed.Base)
		) * (Game.moveSpeed * (Game.level<SlowLevel ? 1:SlowRate))
	}
	#setMoveSpeed(divisor=1) {
		pacman.justArrivedAtTile(divisor)
			&& (this.#speed = this.tileSpeed)
	}
	update(divisor=1) {
		this.#turnCorner(divisor)
		pacman.setNextPos(divisor)
		this.#setMoveSpeed(divisor)
		this.#finishTurningCorner()
		this.#turnAround()
		this.#stopAtWall()
	}
	#turnCorner(divisor=1) {
		const dir = this.s.nextDir
		if (this.canTurn && dir) {
			this.s.turning ||= true
			pacman.orient = dir
			pacman.setNextPos(divisor, dir)
		}
	}
	#finishTurningCorner() {
		const {s}= this
		if (s.turning && pacman.passedTileCenter) {
			s.turning  = false
			s.nextDir  = s.nextTurn
			s.nextTurn = null
			pacman.setMoveDir(pacman.orient)
		}
	}
	#turnAround() {
		pacman.dir == pacman.revOrient
			&& pacman.setMoveDir(pacman.orient)
	}
	#stopAtWall() {
		(this.#stopped = this.collidedWithWall)
			&& (pacman.pos = pacman.tilePos.mul(T))
			&& (this.s.nextDir = null)
	}
}
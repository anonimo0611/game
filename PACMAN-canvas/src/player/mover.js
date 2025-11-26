import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import {pacman}  from './pacman.js';

const Speed = PacSpeed
const {SlowLevel,SlowRate}= Speed

export class Mover {
	#speed    = 0
	#stopped  = true
	#turning  = false
	#nextDir  = /**@type {?Direction}*/(null)
	#nextTurn = /**@type {?Direction}*/(null)
	constructor() {
		$(()=> this.#speed = this.tileSpeed)
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	get speed()   {return this.#speed}
	get stopped() {return this.#stopped}

	get canTurn() {
		return this.#nextDir != null
			&& !pacman.passedTileCenter
			&& !pacman.collidesWithWall (this.#nextDir)
	}
	get collidedWithWall() {
		return !this.#turning && pacman.collidesWithWall()
	}
	get tileSpeed() {
		const eating = Maze.hasDot(pacman.tileIdx)
		return (
			GhsMgr.isFrightMode
			? (eating? Speed.EneEat : Speed.Energized)
			: (eating? Speed.Eating : Speed.Base)
		) * (Game.moveSpeed * (Game.level<SlowLevel ? 1:SlowRate))
	}
	#steer(/**@type {KeyboardEvent}*/e) {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
			|| dir == null
			|| Confirm.opened
			|| Ctrl.activeElem)
			return

		if (this.#turning) {
			this.#nextTurn = dir
			return
		}
		if (pacman.hasAdjWall(dir)) {
			this.#nextDir = dir
			return
		}
		this.#nextDir = dir
		if (pacman.passedTileCenter) {
			pacman.orient = dir
			pacman.setMoveDir(pacman.revDir)
		}
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
		const dir = this.#nextDir
		if (this.canTurn && dir) {
			this.#turning ||= true
			pacman.orient = dir
			pacman.setNextPos(divisor, dir)
		}
	}
	#finishTurningCorner() {
		if (this.#turning && pacman.passedTileCenter) {
			this.#turning  = false
			this.#nextDir  = this.#nextTurn
			this.#nextTurn = null
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
			&& (this.#nextDir = null)
	}
}
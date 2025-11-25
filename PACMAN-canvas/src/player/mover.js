import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import {pacman}  from './pacman.js';

const Step = PacStep
const {SlowLevel,SlowRate}= Step

export class Mover {
	#step     = 0
	#stopped  = true
	#turning  = false
	#nextDir  = /**@type {?Direction}*/(null)
	#nextTurn = /**@type {?Direction}*/(null)
	constructor() {
		$(()=> this.#step = this.stepInTile)
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	get step()    {return this.#step}
	get stopped() {return this.#stopped}

	get canTurn() {
		return this.#nextDir != null
			&& !pacman.passedTileCenter
			&& !pacman.collidedWithWall(this.#nextDir)
	}
	get collidedWithWall() {
		return !this.#turning && pacman.collidedWithWall()
	}
	get stepInTile() {
		const eating = Maze.hasDot(pacman.tileIdx)
		return (
			GhsMgr.isFright
			? (eating? Step.EneEat : Step.Energized)
			: (eating? Step.Eating : Step.Base)
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
	#setMoveStep(divisor=1) {
		pacman.justArrivedAtTile(divisor)
			&& (this.#step = this.stepInTile)
	}
	update(divisor=1) {
		this.#setCornering(divisor)
		pacman.setNextPos(divisor)
		this.#setMoveStep(divisor)
		this.#endCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	#setCornering(divisor=1) {
		const dir = this.#nextDir
		if (this.canTurn && dir) {
			this.#turning ||= true
			pacman.orient = dir
			pacman.setNextPos(divisor, dir)
		}
	}
	#endCornering() {
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
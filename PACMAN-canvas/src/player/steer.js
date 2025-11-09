import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import {pacman as pacm} from './pacman.js';

const Step = PacStep
const{SlowLevel,SlowRate}= PacStep

export class Steer {
	#dir  = /**@type {?Direction}*/(null)
	#next = /**@type {?Direction}*/(null)
	#step    = 0
	#stopped = true
	#turning = false
	get step()    {return this.#step}
	get stopped() {return this.#stopped}

	constructor() {
		$(()=> this.#step = this.stepInTile)
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	get canTurn() {
		return this.#dir != null
			&& pacm.tileCenterReached === false
			&& pacm.collidedWithWall(this.#dir) === false
	}
	get collidedWithWall() {
		return !this.#turning && pacm.collidedWithWall()
	}
	get stepInTile() {
		const eating = Maze.hasDot(pacm.tileIdx)
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
			this.#next = dir
			return
		}
		if (pacm.hasAdjWall(dir)) {
			this.#dir = dir
			return
		}
		this.#dir = dir
		if (pacm.tileCenterReached) {
			pacm.orient = dir
			pacm.setMoveDir(pacm.revDir)
		}
	}
	#setMoveStep(divisor=1) {
		pacm.justArrivedAtTile(divisor)
			&& (this.#step = this.stepInTile)
	}
	update(divisor=1) {
		this.#setCornering(divisor)
		pacm.setNextPos(divisor)
		this.#setMoveStep(divisor)
		this.#endCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	#setCornering(divisor=1) {
		const dir = this.#dir
		if (this.canTurn && dir) {
			this.#turning ||= true
			pacm.orient = dir
			pacm.setNextPos(divisor, dir)
		}
	}
	#endCornering() {
		if (this.#turning && pacm.tileCenterReached) {
			this.#dir  = this.#next
			this.#next = null
			this.#turning = false
			pacm.setMoveDir(pacm.orient)
		}
	}
	#turnAround() {
		pacm.revOrient == pacm.dir
			&& pacm.setMoveDir(pacm.orient)
	}
	#stopAtWall() {
		(this.#stopped = this.collidedWithWall)
			&& (pacm.pos  = pacm.tilePos.mul(T))
			&& (this.#dir = null)
	}
}
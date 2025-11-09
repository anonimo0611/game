import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {GhsMgr}  from '../ghosts/_system.js'
import {pacman as self} from './pacman.js';

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
			&& self.tileCenterReached === false
			&& self.collidedWithWall(this.#dir) === false
	}
	get collidedWithWall() {
		return !this.#turning && self.collidedWithWall()
	}
	get stepInTile() {
		const eating = Maze.hasDot(self.tileIdx)
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
		if (self.hasAdjWall(dir)) {
			this.#dir = dir
			return
		}
		this.#dir = dir
		if (self.tileCenterReached) {
			self.orient = dir
			self.setMoveDir(self.revDir)
		}
	}
	#setMoveStep(divisor=1) {
		self.justArrivedAtTile(divisor)
			&& (this.#step = this.stepInTile)
	}
	update(divisor=1) {
		this.#setCornering(divisor)
		self.setNextPos(divisor)
		this.#setMoveStep(divisor)
		this.#endCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	#setCornering(divisor=1) {
		const dir = this.#dir
		if (this.canTurn && dir) {
			this.#turning ||= true
			self.orient = dir
			self.setNextPos(divisor, dir)
		}
	}
	#endCornering() {
		if (this.#turning && self.tileCenterReached) {
			this.#dir  = this.#next
			this.#next = null
			this.#turning = false
			self.setMoveDir(self.orient)
		}
	}
	#turnAround() {
		self.revOrient == self.dir
			&& self.setMoveDir(self.orient)
	}
	#stopAtWall() {
		(this.#stopped = this.collidedWithWall)
			&& (self.pos  = self.tilePos.mul(T))
			&& (this.#dir = null)
	}
}
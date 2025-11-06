import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Ctrl}    from '../control.js';
import {pacman as self} from './pacman.js';

export class SteerPacman {
	#dir  = /**@type {?Direction}*/(null)
	#next = /**@type {?Direction}*/(null)
	#stopped = true
	#turning = false
	constructor() {
		$win.offon('keydown.Steer', this.#steer.bind(this))
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
		if (self.inBackHalfOfTile) {
			self.orient = dir
			self.setMoveDir(self.revDir)
		}
	}
	get stopped() {
		return this.#stopped
	}
	get canTurn() {
		return this.#dir != null
			&& self.inFrontHalfOfTile
			&& self.collidedWithWall(this.#dir) === false
	}
	update() {
		this.#setCornering()
		self.setNextPos(self.stepDiv)
		this.#endCornering()
		this.#turnAround()
		this.#stopAtWall()
	}
	#stopAtWall() {
		this.#stopped = false
		if (!this.#turning
		 && self.collidedWithWall()) {
			self.pos  = self.tilePos.mul(T)
			this.#dir = null
			this.#stopped = true
		}
	}
	#setCornering() {
		const dir = this.#dir
		if (this.canTurn && dir) {
			this.#turning ||= true
			self.setNextPos(self.stepDiv, self.orient=dir)
		}
	}
	#endCornering() {
		if (this.#turning && self.inBackHalfOfTile) {
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
}
import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {State}   from '../state.js';
import {pacman as self} from './pacman.js';

export class SteerPacman {
	#dir  = /**@type {?Direction}*/(null)
	#next = /**@type {?Direction}*/(null)
	#turning = false
	constructor() {
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	#allowKey(/**@type {KeyboardEvent}*/e) {
		const dir = Dir.from(e,{wasd:true})
		return keyRepeat(e)
			|| Confirm.opened
			|| (dir == null)
			|| (dir == this.#dir && !this.#turning)
			? null : dir
	}
	#steer(/**@type {KeyboardEvent}*/e) {
		const dir = this.#allowKey(e)
		if (!dir) return

		if (this.#turning) {
			this.#next = dir
			return
		}
		if (self.hasAdjWall(dir)) {
			this.#dir = dir
			return
		}
		if (State.isSt_Ready && Vec2[dir].x || self.stopped) {
			[this.#dir, self.dir] = [null, dir]
			return
		}
		this.#dir = dir
		if (self.inBackHalfOfTile) {
			self.orient = dir
			self.setMoveDir(self.revDir)
		}
	}
	get canTurn() {
		return this.#dir != null
			&& self.inFrontHalfOfTile
			&& self.collidedWithWall(this.#dir) === false
	}
	stopAtWall() {
		if (!this.#turning
		 && self.collidedWithWall()) {
			self.pos = self.tilePos.mul(T)
			return !(this.#dir = null)
		}
		return false
	}
	move(divisor=1) {
		this.#setCornering(divisor)
		self.setNextPos(divisor)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(divisor=1) {
		const dir = this.#dir
		if (this.canTurn && dir) {
			this.#turning ||= true
			self.setNextPos(divisor, self.orient=dir)
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
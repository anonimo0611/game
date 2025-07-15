import {State}   from '../state.js';
import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {player}  from './player.js';

export class Steer {
	#dir  = /**@type {?Direction}*/(null)
	#next = /**@type {?Direction}*/(null)
	#turning = false
	constructor() {
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	#steer(/**@type {JQuery.KeyboardEventBase}*/e) {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || Confirm.opened
		 || (dir == null)
		 || (dir == this.#dir && !this.#turning))
			return
		if (this.#turning) {
			this.#next = dir
			return
		}
		if (player.hasAdjWall(dir)) {
			this.#dir = dir
			return
		}
		if (State.isSt_Ready && Vec2[dir].x || player.stopped) {
			[this.#dir, player.dir] = [null, dir]
			return
		}
		this.#dir = dir
		if (player.inBackOfTile) {
			player.orient = dir
			player.setMoveDir(player.revDir)
		}
	}
	get canTurn() {
		return this.#dir != null
			&& player.inFrontOfTile
			&& player.collidedWithWall(this.#dir) === false
	}
	stopAtWall() {
		if (!this.#turning && player.collidedWithWall()) {
			player.pos = player.tilePos.mul(T)
			return !(this.#dir = null)
		} return false
	}
	move(divisor=1) {
		this.#setCornering(divisor)
		player.setNextPos(divisor)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(divisor=1) {
		const dir = this.#dir
		if (this.canTurn && dir) {
			this.#turning ||= true
			player.setNextPos(divisor, player.orient=dir)
		}
	}
	#endCornering() {
		if (this.#turning && player.inBackOfTile) {
			this.#dir  = this.#next
			this.#next = null
			this.#turning = false
			player.setMoveDir(player.orient)
		}
	}
	#turnAround() {
		player.revOrient == player.dir
			&& player.setMoveDir(player.orient)
	}
}
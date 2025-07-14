import {Confirm} from '../../_lib/confirm.js';
import {Dir}     from '../../_lib/direction.js';
import {State}   from '../state.js';
import {Player}  from './player.js';

export class Steer {
	#turn = false
	#dir  = /**@type {?Direction}*/(null)
	#next = /**@type {?Direction}*/(null)
	constructor(player=Player.i) {
		/** @private @readonly */
		this.p = player
		$win.offon('keydown.Steer', this.#steer.bind(this))
	}
	#steer(/**@type {JQuery.KeyboardEventBase}*/e) {
		const {p}= this, dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || Confirm.opened
		 || (dir == null)
		 || (dir == this.#dir && !this.#turn))
			return
		if (this.#turn) {
			this.#next = dir
			return
		}
		if (p.hasAdjWall(dir)) {
			this.#dir = dir
			return
		}
		if (State.isSt_Ready && Vec2[dir].x || p.stopped) {
			[this.#dir, p.dir] = [null, dir]
			return
		}
		this.#dir = dir
		if (p.inBackOfTile) {
			p.orient = dir
			p.setMoveDir(p.revDir)
		}
	}
	get canTurn() {
		return this.#dir != null
			&& this.p.inFrontOfTile
			&& this.p.collidedWithWall(this.#dir) === false
	}
	get stoppedAtWall() {
		const {p}= this
		if (!this.#turn && p.collidedWithWall()) {
			p.pos = p.tilePos.mul(T)
			return !(this.#dir = null)
		}return false
	}
	cornering(divisor=1) {
		this.#setCornering(divisor)
		this.#endCornering()
		this.#turnAround()
	}
	#setCornering(divisor=1) {
		const {p}= this, dir = this.#dir
		if (this.canTurn && dir) {
			this.#turn ||= true
			p.setNextPos(divisor, p.orient=dir)
		}
	}
	#endCornering() {
		const {p}= this
		if (this.#turn && p.inBackOfTile) {
			this.#dir  = this.#next
			this.#next = null
			this.#turn = false
			p.setMoveDir(p.orient)
		}
	}
	#turnAround() {
		const {p}= this
		p.revOrient == p.dir && p.setMoveDir(p.orient)
	}
}
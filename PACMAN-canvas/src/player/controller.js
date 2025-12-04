import {Dir}     from '../../_lib/direction.js';
import {Confirm} from '../../_lib/confirm.js';
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js';
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js';
import {GhsMgr}  from '../ghosts/_system.js'

const Speed = PacSpeed
const {SlowLevel,SlowRate}= Speed

class TurnState {
	turning  = false
	nextDir  = /**@type {?Direction}*/(null)
	nextTurn = /**@type {?Direction}*/(null)
}
export class Mover extends Actor {
	#speed   = 0
	#stopped = true
	get speed()   {return this.#speed ||= this.tileSpeed}
	get stopped() {return this.#stopped}

	constructor(col=0,row=0) {
		super()
		/** @private */
		this.s = new TurnState
		this.pos.set(col*T, row*T)
		$win.off('keydown.PacSteer')
		setSteerEvent({m:this,s:this.s})
	}
	get canTurn() {
		return this.s.nextDir != null
			&& !this.passedTileCenter
			&& !this.collidesWithWall(this.s.nextDir)
	}
	get canMove() {
		return this.s.turning || !this.collidesWithWall()
	}
	get tileSpeed() {
		const eating = Maze.hasDot(this.tileIdx)
		return (
			GhsMgr.isFrightMode
			? (eating? Speed.EneEat : Speed.Energized)
			: (eating? Speed.Eating : Speed.Base)
		) * (Game.moveSpeed * (Game.level<SlowLevel ? 1:SlowRate))
	}
	update(divisor=1) {
		this.#turnCorner(divisor)
		this.setNextPos(divisor)
		this.#setMoveSpeed(divisor)
		this.#finishTurningCorner()
		this.#turnAround()
	}
	#setMoveSpeed(divisor=1) {
		this.justArrivedAtTile(divisor)
			&& (this.#speed = this.tileSpeed)
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
		(this.#stopped = !this.canMove)
			&& (this.pos = this.tilePos.mul(T))
			&& (this.s.nextDir = null)
	}
}

/** @param {{s:TurnState,m:Mover}} param */
function setSteerEvent({s,m}) {
	$win.on('keydown.PacSteer', e=> {
		const dir = Dir.from(e,{wasd:true})
		if (keyRepeat(e)
		 || dir == null
		 || Confirm.opened
		 || Ctrl.activeElem
		) return

		if (s.turning) {
			s.nextTurn = dir
			return
		}
		if (m.hasAdjWall(dir)) {
			s.nextDir = dir
			return
		}
		if (State.isStartMode && Vec2[dir].x) {
			[m.dir,s.nextTurn]= [dir,null]
			return
		}
		s.nextDir = dir
		if (m.passedTileCenter) {
			m.orient = dir
			m.setMoveDir(m.revDir)
		}
	})
}
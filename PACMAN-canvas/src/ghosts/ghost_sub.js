import {Maze}   from '../maze.js'
import {State}  from '../state.js'
import {player} from '../player/player.js'
import {Ghosts} from './_system.js'
import {Ghost}  from './ghost.js'

export class Akabei extends Ghost {
	constructor() {
		super(L, {type:0, tile:[13.5, 12]})
	}
	get chaseSpeed()   {return Ghosts.CruiseElroy.speed}
	get isAngry()      {return Ghosts.CruiseElroy.angry}
	get isChasing()    {return this.isNormal && !this.isScattering}
	get isScattering() {return super.isScattering && !this.isAngry}
}

export class Pinky extends Ghost {
	constructor() {
		super(D, {type:1, tile:[13.5, 15]})
	}
	get chaseOffset() {return 4}
	get scatterTile() {return Vec2.new(3, 0)}
	get chasePos() {
		const pos = player.offsetTarget(this.chaseOffset)
		switch(player.tunEntry.side) {
		case L: return pos.setX(Maze.Tunnel.EntryCol.R*T)
		case R: return pos.setX(Maze.Tunnel.EntryCol.L*T)
		default:return pos
		}
	}
}

export class Aosuke extends Ghost {
	/** @readonly */
	constructor() {
		super(U, {type:2, tile:[11.5, 15], align:-1})
	}
	get chaseOffset() {return 2}
	get scatterTile() {return Vec2.new(27, 33)}
	get chasePos() {
		const  Aka = Ghosts.of(GhostType.Akabei)
		const  pos = player.offsetTarget(this.chaseOffset)
		return pos.clone.sub(Aka.center).add(pos)
	}
}

export class Guzuta extends Ghost {
	/** @readonly */
	static THRESHOLD = 8
	constructor() {
		super(U, {type:3, tile:[15.5, 15], align:+1})
	}
	get scatterTile() {return Vec2.new(0, 33)}
	get chasePos() {
		const {center,pos}= player
		return Vec2.sqrMag(this, pos) < (T*Guzuta.THRESHOLD)**2
			? this.scatterTile.add(.5).mul(T) : center
	}
}

const Classes = /**@type {const}*/([Akabei,Pinky,Aosuke,Guzuta])
State.on({_Ready:_=> Ghosts.initialize(Classes.map(c=> new c))})

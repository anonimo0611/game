import {Maze}  from '../maze.js'
import {State} from '../state.js'
import {player,Ghosts,Ghost} from '../actors.js'

class Akabei extends Ghost {
	constructor() {
		super({dir:DirL, type:0, tile:[13.5, 12]})
	}
	get scatterTile()  {return Vec2.new(COLS-4, 0)}
	get chaseSpeed()   {return Ghosts.CruiseElroy.speed}
	get isAngry()      {return Ghosts.CruiseElroy.angry}
	get isChasing()    {return this.isNormal && !this.isScattering}
	get isScattering() {return super.isScattering && !this.isAngry}
}

class Pinky extends Ghost {
	constructor() {
		super({dir:DirD, type:1, tile:[13.5, 15]})
	}
	get chaseOffset() {return 4*T}
	get scatterTile() {return Vec2.new(3, 0)}
	get chasePos() {
		const pos = player.offsetTarget(this.chaseOffset)
		// Modified Pinky's targeting scheme:
		// guides her toward the opposite exit of the tunnel if the player enters it.
		switch(player.tunEntry.side) {
		case DirL: return pos.setX(Maze.Tunnel.EntryCol.R*T)
		case DirR: return pos.setX(Maze.Tunnel.EntryCol.L*T)
		default:return pos
		}
	}
}

class Aosuke extends Ghost {
	constructor() {
		super({dir:DirU, type:2, tile:[11.5, 15], align:-1})
	}
	get chaseOffset() {return 2*T}
	get scatterTile() {return Vec2.new(COLS-1, ROWS-1)}
	get chasePos() {
		const  Aka = Ghosts.of(GhostType.Akabei)
		const  pos = player.offsetTarget(this.chaseOffset)
		return pos.clone.sub(Aka.center).add(pos)
	}
}

class Guzuta extends Ghost {
	constructor() {
		super({dir:DirU, type:3, tile:[15.5, 15], align:+1})
	}
	get scatterTile() {return Vec2.new(0, ROWS-1)}
	get chasePos() {
		const {center,pos}= player
		return Vec2.sqrMag(this,pos) < (T*GUZUTA_THRESHOLD)**2
			? this.scatterTile.add(.5).mul(T) : center
	}
} export const GUZUTA_THRESHOLD = 8

{// Event-driven instantiation
	const ghosts = [Akabei,Pinky,Aosuke,Guzuta]
	State.on({_Ready(){Ghosts.initialize(ghosts.map(g=> new g))}})
}
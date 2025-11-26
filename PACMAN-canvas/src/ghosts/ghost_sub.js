import {Maze}   from '../maze.js'
import {State}  from '../state.js'
import {pacman} from '../player/pacman.js'
import {GhsMgr} from './_system.js'
import {Ghost}  from './ghost.js'

class Akabei extends Ghost {
	constructor() {
		super(L, {type:0, tile:[13.5, 12]})
	}
	get angry()      {return GhsMgr.CruiseElroy.angry}
	get chaseSpeed() {return GhsMgr.CruiseElroy.speed}
}

class Pinky extends Ghost {
	constructor() {
		super(D, {type:1, tile:[13.5, 15]})
	}
	get scatterTile() {
		return Vec2.new(3, 0)
	}
	get chasePos() {
		const pos = pacman.offsetTarget(4)
		switch(pacman.TunnelEntry.side) {
		case L: return pos.setX(Maze.Tunnel.EntranceR*T)
		case R: return pos.setX(Maze.Tunnel.EntranceL*T)
		default:return pos
		}
	}
}

class Aosuke extends Ghost {
	constructor() {
		super(U, {type:2, tile:[11.5, 15], align:-1})
	}
	get scatterTile() {
		return Vec2.new(27, 33)
	}
	get chasePos() {
		const  pos = pacman.offsetTarget(2)
		return pos.clone.sub(GhsMgr.akaCenterPos).add(pos)
	}
}

class Guzuta extends Ghost {
	constructor() {
		super(U, {type:3, tile:[15.5, 15], align:+1})
	}
	get scatterTile() {
		return Vec2.new(0, 33)
	}
	get chasePos() {
		return this.sqrMagToPacman < (T*8) ** 2
		? this.scatterTile.add(.5).mul(T)
		: pacman.center
	}
}

State.on({_Restarted_NewLevel:()=>
	GhsMgr.trigger('Init', [Akabei,Pinky,Aosuke,Guzuta].map(cls=> new cls))
})
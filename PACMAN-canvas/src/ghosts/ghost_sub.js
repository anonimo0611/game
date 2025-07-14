import {Maze}   from '../maze.js'
import {State}  from '../state.js'
import {Player} from '../player/player.js'
import {GhsMgr} from './_system.js'
import {Ghost}  from './ghost.js'

class Akabei extends Ghost {
	constructor() {
		super(L, {idx:0, col:13.5, row:12})
	}
	get scatterTile() {return Vec2(24, 0)}
	get isAngry()     {return GhsMgr.Elroy.angry}
	get chaseStep()   {return GhsMgr.Elroy.step}
}

class Pinky extends Ghost {
	constructor() {
		super(D, {idx:1, col:13.5, row:15})
	}
	get scatterTile() {return Vec2(3, 0)}
	get chasePos() {
		const {i:P}=Player, {x,y}= P.forwardOfst(4)
		switch(P.tunnelEntry) {
		case L:  return Vec2(Maze.Tunnel.EntranceR*T, y)
		case R:  return Vec2(Maze.Tunnel.EntranceL*T, y)
		default: return Vec2(x, y)
		}
	}
}

class Aosuke extends Ghost {
	constructor() {
		super(U, {idx:2, col:11.5, row:15, align:-1})
	}
	get scatterTile() {return Vec2(27, 33)}
	get chasePos() {
		const  pos = Player.i.forwardOfst(2)
		return pos.clone.sub(GhsMgr.akaCenter).add(pos)
	}
}

class Guzuta extends Ghost {
	constructor() {
		super(U, {idx:3, col:15.5, row:15, align:+1})
	}
	get scatterTile() {return Vec2(0, 33)}
	get chasePos() {
		return this.sqrMagToPacman < (T*8) ** 2
		? Vec2(this.scatterTile).add(.5).mul(T)
		: Player.i.center
	}
}

State.on({_Restart_NewLevel:()=>
	GhsMgr.trigger('Init', [Akabei,Pinky,Aosuke,Guzuta].map(cls=> new cls))
})
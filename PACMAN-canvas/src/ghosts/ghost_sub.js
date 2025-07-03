import {Maze}   from '../maze.js'
import {State}  from '../state.js'
import {Player} from '../pacman.js'
import {GhsMgr} from './_system.js'
import {Ghost}  from './ghost.js'

class Akabei extends Ghost {
	constructor() {
		super(L, {idx:0, col:13.5, row:12})
	}
	get isAngry()     {return GhsMgr.Elroy.angry}
	get chaseStep()   {return GhsMgr.Elroy.step}
	get scatterTile() {return Vec2(24, 0)}
}

class Pinky extends Ghost {
	constructor() {
		super(D, {idx:1, col:13.5, row:15})
	}
	get chasePos() {
		const {Tunnel}=Maze, {i:P}=Player, pos=P.forwardOfst(4)
		Tunnel.isIn(P.center,L) && P.dir == L && (pos.x=Tunnel.EntranceR*T)
		Tunnel.isIn(P.center,R) && P.dir == R && (pos.x=Tunnel.EntranceL*T)
		return pos
	}
	get scatterTile() {return Vec2(3, 0)}
}

class Aosuke extends Ghost {
	constructor() {
		super(U, {idx:2, col:11.5, row:15, align:-1})
	}
	get chasePos() {
		const  pos = Player.i.forwardOfst(2)
		return pos.clone.sub(GhsMgr.akaCenter).add(pos)
	}
	get scatterTile() {return Vec2(27, 33)}
}

class Guzuta extends Ghost {
	constructor() {
		super(U, {idx:3, col:15.5, row:15, align:+1})
	}
	get chasePos() {
		return this.sqrMagToPacman < (T*8) ** 2
			? Vec2(this.scatterTile).add(.5).mul(T)
			: Player.i.center
	}
	get scatterTile() {return Vec2(0, 33)}
}
State.on('_Restart_NewLevel',()=> {
	GhsMgr.trigger('Init', [Akabei,Pinky,Aosuke,Guzuta].map(cls=> new cls))
})
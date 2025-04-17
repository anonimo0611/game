import {Maze}   from '../maze.js'
import {Player} from '../pacman.js'
import {GhsMgr} from './_system.js'
import {Ghost}  from './ghost.js'

class Akabei extends Ghost {
	constructor() {
		super({idx:0, col:13.5, row:12, orient:L})
	}
	get scatterTile() {return Vec2(24, 0)}
	get angry()       {return GhsMgr.Elroy.angry}
	get chaseStep()   {return GhsMgr.Elroy.step}
}
class Pinky extends Ghost {
	constructor() {
		super({idx:1, col:13.5, row:15, orient:D})
	}
	get scatterTile() {return Vec2(3, 0)}
	get chasePos() {
		const {Tunnel}=Maze, P=Player, pos=P.forwardPos(4)
		Tunnel.isInL(P.centerPos) && P.dir == L && (pos.x=Tunnel.entranceR*T)
		Tunnel.isInR(P.centerPos) && P.dir == R && (pos.x=Tunnel.entranceL*T)
		return pos
	}
}
class Aosuke extends Ghost {
	constructor() {
		super({idx:2, col:11.5, row:15, orient:U, initAlign:-1})
	}
	get scatterTile() {return Vec2(27, 33)}
	get chasePos() {
		const  pos = Player.forwardPos(2)
		return pos.clone.sub(GhsMgr.akaCenter).add(pos)
	}
}
class Guzuta extends Ghost {
	constructor() {
		super({idx:3, col:15.5, row:15, orient:U, initAlign:+1})
	}
	get scatterTile() {return Vec2(0, 33)}
	get chasePos() {
		const  radius = T*8
		return this.sqrMagToPacman < radius*radius
			? Vec2(this.scatterTile).add(.5).mul(T)
			: Player.centerPos
	}
}
$on({Title_Restart_NewLevel:
	()=> $(GhsMgr).trigger('Init',[Akabei,Pinky,Aosuke,Guzuta])})
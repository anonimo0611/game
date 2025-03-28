import {Maze}   from '../maze.js'
import {Player} from '../pacman/_pacman.js'
import {GhsMgr} from './_system.js'
import {Ghost}  from './_ghost.js'

class Akabei extends Ghost {
	constructor() {
		super({idx:0, col:13.5, row:12, orient:L})
		freeze(this)
	}
	get scatterTile() {return Vec2(24, 0)}
	get angry()       {return GhsMgr.Elroy.angry}
	get chaseStep()   {return GhsMgr.Elroy.step}
}
class Pinky extends Ghost {
	constructor() {
		super({idx:1, col:13.5, row:15, orient:D})
		freeze(this)
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
		freeze(this)
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
		freeze(this)
	}
	get scatterTile() {return Vec2(0, 33)}
	get chasePos() {
		return this.distanceToPacman < T*8
			? Vec2(this.scatterTile).mul(T).add(T/2)
			: Player.centerPos
	}
}
$on('Title Restart NewLevel', ()=> {
	$(GhsMgr).trigger('Init', [Akabei,Pinky,Aosuke,Guzuta])
})
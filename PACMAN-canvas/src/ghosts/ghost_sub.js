import {U,R,D,L} from '../../_lib/direction.js'
import {Vec2}    from '../../_lib/vec2.js'
import {Maze}    from '../maze.js'
import {PacMgr}  from '../pacman/pac.js'
import {GhsMgr}  from './_system.js'
import {Ghost}   from './ghost.js'
import {TileSize as T,GhsType} from '../_constants.js'

class Akabei extends Ghost {
	constructor() {
		super({idx:0, col:13.5, row:12, orient:L})
		freeze(this)
	}
	get angry()     {return GhsMgr.Elroy.angry}
	get chaseStep() {return GhsMgr.Elroy.step}
}
class Pinky extends Ghost {
	scatterTile = Vec2(3, 0).freeze()
	constructor() {
		super({idx:1, col:13.5, row:15, orient:D})
		freeze(this)
	}
	get chasePos() {
		const Pac = PacMgr
		const pos = PacMgr.forwardPos(4)
		const {Tunnel}= Maze
		Tunnel.isInL(Pac.centerPos) && Pac.dir == L && (pos.x=Tunnel.entranceR*T)
		Tunnel.isInR(Pac.centerPos) && Pac.dir == R && (pos.x=Tunnel.entranceL*T)
		return pos
	}
}
class Aosuke extends Ghost {
	scatterTile = Vec2(27, 33).freeze()
	constructor() {
		super({idx:2, col:11.5, row:15, orient:U, initAlign:-1})
		freeze(this)
	}
	get chasePos() {
		const  pos = PacMgr.forwardPos(2)
		return pos.clone.sub(GhsMgr.centerPos(GhsType.Akabei)).add(pos)
	}
}
class Guzuta extends Ghost {
	scatterTile = Vec2(0, 33).freeze()
	constructor() {
		super({idx:3, col:15.5, row:15, orient:U, initAlign:+1})
		freeze(this)
	}
	get chasePos() {
		return this.distanceToPacman < T*8
			? Vec2(this.scatterTile).mul(T).add(T/2)
			: PacMgr.centerPos
	}
}
$on('Title Restart NewLevel', ()=> {
	$(GhsMgr).trigger('Init', [Akabei,Pinky,Aosuke,Guzuta])
})
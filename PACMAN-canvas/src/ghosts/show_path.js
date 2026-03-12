import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

export class PathMgr {
	#path = /**@type {PathNode[]}*/([])
	static draw(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw(g))
	}
	#draw(/**@type {Ghost}*/g) {
		if (!this.#path.length)
			return
		if (!g.isChasing
		 && !g.isScattering
		 && !g.state.isEscaping)
			return
		const {dir,pos}= g, LineWidth = T/5
		let   last = g.tilePos.mul(T)
		const ofst = [-2,-1,1,2][g.type]*LineWidth
		const endT = this.#path.at(-1)?.tile
		const stPt = this.#path[0].tile.clone.mul(T)
		const dist = Vec2.dot(Vec2[dir],Vec2.sub(pos,stPt))
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(T/2+ofst, T/2+ofst)
		Fg.lineWidth   = LineWidth
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[g.type]
		Fg.beginPath()
		Fg.moveTo(...pos.vals)
		for (const {tile,dir,stopped} of this.#path) {
			const curr = tile.clone.mul(T)
			if (tile == endT) {
				tile.eq(p.tilePos) && !g.isEscaping
					? curr.set(p.pos)
					: curr.add(Vec2[dir].mul(stopped? 0 : dist))
				stopped && curr.shiftByAxis(dir, -ofst)
			}
			if (abs(curr.x - last.x) > T*3) {
				Fg.lineTo((curr.x < last.x ? BW+T : -T), curr.y);break
			}
			Fg.lineTo(...curr.vals)
			if (tile == endT) { // Arrow
				Fg.save()
				Fg.translate(...curr.vals)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
			last = curr
		}
		Fg.stroke()
		Fg.restore()
	}
	update(/**@type {Ghost}*/g) {
		if (Maze.House.arrived(g, T*1.5))
			return
		const {tilePos:t}= g, path=[], Steps=16
		let dir  = g.dir, stopped = false
		let tile = g.passedTileCenter? g.getAdjTile(dir,t):t
		if (t.x < 0)      tile.x = 0
		if (t.x > Cols-1) tile.x = Cols-1
		path.push({tile,dir,stopped})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			stopped = g.isTargetPac && tile.eq(p.tilePos)
			       || g.hasFixedTgt && tile.eq(g.targetTile)
			path.push({tile,dir,stopped});if (stopped) break
		}
		this.#path = path
	}
}
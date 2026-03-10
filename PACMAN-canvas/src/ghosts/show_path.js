import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

export class PathMgr {
	/** @private */
	path = /**@type {PathNode[]}*/([])
	static draw(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw(g))
	}
	#draw(/**@type {Ghost}*/g) {
		if (!this.path.length)
			return
		if (!g.isChasing
		 && !g.isScattering
		 && !g.state.isEscaping)
			return
		const {dir,center}= g, LineWidth = T/5
		let   last = g.tileMid.mul(T)
		const ofst = [-2,-1,1,2][g.type]*LineWidth
		const lstT = this.path.at(-1)?.tile
		const stPt = this.path[0].tile.clone.add(0.5).mul(T)
		const dist = Vec2.dot(Vec2[dir],Vec2.sub(center,stPt))
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(ofst, ofst)
		Fg.lineWidth   = LineWidth
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[g.type]
		Fg.beginPath()
		Fg.moveTo(...center.vals)
		for (const {tile,dir,stopped} of this.path) {
			const curr = tile.clone.add(0.5).mul(T)
			if (tile == lstT) {
				tile.eq(p.tilePos) && !g.isEscaping
					? curr.set(p.center)
					: curr.add(Vec2[dir].mul(stopped? 0 : dist))
				stopped && curr.shiftByAxis(dir, -ofst)
			}
			if (abs(curr.x - last.x) > T*2) {
				Fg.lineTo((curr.x < last.x ? BW+T : -T), curr.y);break
			}
			Fg.lineTo(...curr.vals)
			if (tile == lstT) { // Arrow
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
		if (g.inTunSide && (t.x < 1 || t.x > Cols-2)) tile=t
		path.push({tile,dir,stopped})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			stopped = g.isTargetPac && tile.eq(p.tilePos)
			       || g.hasFixedTgt && tile.eq(g.targetTile)
			path.push({tile,dir,stopped});if (stopped) break
		}
		this.path = path
	}
}
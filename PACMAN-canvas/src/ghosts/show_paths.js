import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

const PathSteps = 16

export class PathMgr {
	#path = /**@type {PathNode[]}*/([])
	static draw(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw(g))
	}
	static update(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.forEach(g=> g.pathMgr.#update(g))
	}
	#draw(/**@type {Ghost}*/g) {
		if (!this.#path.length)
			return
		if (!g.isChasing
		 && !g.isScattering
		 && !g.state.isEscaping)
			return
		const path = this.#path, lw = T/5
		const endT = path.at(-1)?.tile
		const stPt = path[0].tile.clone.mul(T)
		const ofst = [-2,-1,1,2][g.type]*lw
		const dist = Vec2.distance(g.pos,stPt)
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(T/2+ofst, T/2+ofst)
		Fg.beginPath()
		Fg.moveTo(...g.pos.vals)
		for(const [i,{tile,dir,stopped}] of path.entries()) {
			const curr = tile.clone.mul(T)
			const last = path[i-1]?.tile.clone.mul(T) ?? g.pos
			if (tile == endT) {
				stopped && g.isTargetPac
					? curr.set(p.pos)
					: curr.add(Vec2[dir].mul(stopped? 0 : T/2-dist))
			}
			if (abs(curr.x - last.x) > T*3) {
				Fg.lineTo((curr.x < last.x ? BW+T : -T), curr.y);
				return true
			}
			Fg.lineTo(...curr.vals)
			if (tile == endT) { // Arrow
				Fg.save()
				Fg.translate(...curr.vals)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
		}
		Fg.lineWidth = lw
		Fg.lineJoin  = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[g.type]
		Fg.stroke()
		Fg.restore()
	}
	#update(/**@type {Ghost}*/g) {
		const {dir,orient}= g
		if (dir != orient || Maze.House.arrived(g, T*2))
			return
		const tile = g.getAdjTile(dir,g.tile)
		const path = [{dir,tile,stopped:false}]
		for(const i of range(PathSteps)) {
			const {dir:d,tile:t}= path[(i+1)-1]
			const tgt  = g.getTargetTile(t)
			const dir  = g.getNextDir(d,t,tgt)
			const tile = g.getAdjTile(dir,t)
			path.push({tile,dir,stopped:
				g.isTargetPac && tile.eq(p.tile) ||
				g.hasFixedTgt && tile.eq(tgt)
			})
			if (path[i+1].stopped) break
		} this.#path = path
	}
}
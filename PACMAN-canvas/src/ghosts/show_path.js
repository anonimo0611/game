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
		const lw   = T/5
		let   last = g.pos
		const ofst = [-2,-1,1,2][g.type]*lw
		const endT = this.#path.at(-1)?.tile
		const stPt = this.#path[0].tile.clone.mul(T)
		const dist = Vec2.distance(g.pos,stPt)
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(T/2+ofst, T/2+ofst)
		Fg.lineWidth   = lw
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[g.type]
		Fg.beginPath()
		Fg.moveTo(...g.pos.vals)
		for (const {tile,dir,stopped} of this.#path) {
			const curr = tile.clone.mul(T)
			if (tile == endT) {
				stopped && g.isTargetPac
					? curr.set(p.pos)
					: curr.add(Vec2[dir].mul(stopped? 0 : T/2-dist))
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
	#update(/**@type {Ghost}*/g) {
		if (g.dir != g.orient || Maze.House.arrived(g, T*2))
			return
		let   dir  = g.dir, stopped = false
		let   tile = g.getAdjTile(dir,g.tile)
		const path = [{tile,dir,stopped}], Steps = 16
		for(const _ of range(Steps)) {
			const t = g.getTargetTile(tile)
			dir     = g.getNextDir(dir,tile,t)
			tile    = g.getAdjTile(dir,tile)
			stopped = g.isTargetPac && tile.eq(p.tile)
			       || g.hasFixedTgt && tile.eq(t)
			path.push({tile,dir,stopped})
			if (stopped) break
		}
		this.#path = path
	}
}
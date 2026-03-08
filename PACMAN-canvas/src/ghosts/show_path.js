import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

const Steps  = 16
const AkaIdx = GhsType.Akabei
const Ofsts  = freeze([-2,-1,1,2])

export class PathMgr {
	#path = /**@type {PathNode[]}*/([])
	static draw(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw(g))
	}
	#draw(/**@type {Ghost}*/g) {
		if (!this.#path.length) return
		if (!g.isChasing
		 && !g.isScattering
		 && !g.state.isEscaping) return
		const {dir,center}= g, lw = T/4
		let   pos  = g.tileMid.mul(T)
		const ofst = Ofsts[g.type]*lw
		const lstT = this.#path.at(-1)?.tile
		const stPt = this.#path[0].tile.clone.add(0.5).mul(T)
		const dist = Vec2.dot(Vec2[dir],Vec2.sub(center,stPt))
		Fg.save()
		Fg.setAlpha(0.6)
		Fg.translate(ofst, ofst)
		Fg.lineWidth   = lw
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[g.type]
		Fg.beginPath()
		Fg.moveTo(...center.vals)
		Fg.lineTo(...pos.vals)
		for (const {tile,dir,stopped} of this.#path) {
			let next = tile.clone.add(.5).mul(T)
			if (tile == lstT) {
				(g.type == AkaIdx) && tile.eq(p.tilePos)
					? next.set(p.center)
					: next.add(Vec2[dir].mul(stopped? 0 : dist))
				stopped && (next[Vec2[dir].x ? 'x':'y'] -= ofst)
			}
			if (abs(next.x - pos.x) > T*2) {
				Fg.lineTo((next.x < pos.x ? BW+T : -T), next.y);break
			}
			Fg.lineTo(...next.vals)
			if (tile == lstT) { // Arrow
				Fg.save()
				Fg.translate(...next.vals)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
			pos = next
		}
		Fg.stroke()
		Fg.restore()
	}
	update(/** @type {Ghost}*/g) {
		if (Maze.House.arrived(g, T*1.5)) return
		const path=[], {tilePos:t}= g
		const isHaltableState = (g.isScattering || g.state.isEscaping)
		let dir  = g.dir
		let tile = g.passedTileCenter? g.getAdjTile(dir,t):t
		if (g.inTunSide && (t.x < 1 || t.x > Cols-2)) tile=t
		path.push({tile,dir,stopped:false})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			const stopped =
				(g.type == AkaIdx) && tile.eq(p.tilePos)
				|| isHaltableState && tile.eq(g.targetTile)
			path.push({tile,dir,stopped});if(stopped)break
		} this.#path = path
	}
}
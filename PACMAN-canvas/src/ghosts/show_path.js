import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

const Steps = 16
const Ofsts = /**@type {Readonly<xyTuple[]>}*/
	([[-2,-2], [-1,-1], [1,1], [2,2]])

export class PathMgr {
	/** @param {readonly Ghost[]} ghosts */
	static draw(ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw(g))
	}
	#path = /**@type {PathNode[]}*/([])
	get begin() {return this.#path[0]}
	get end()   {return this.#path.at(-1) ?? this.begin}
	/** @param {Ghost} g */
	enabled(g) {
		if (Maze.House.arrived(g, T*1.5)) return false
		if (!between(g.center.x, -T/2, BW+T/2)) return false
		return g.isChasing || g.isScattering || g.state.isEscaping
	}
	/** @param {Ghost} g */
	#draw(g) {
		if (!this.enabled(g) || !this.#path.length) return
		const {type,dir,center}= g, lw = T/4
		const st   = this.begin.tile.clone.add(.5).mul(T)
		const ofst = Vec2.new(...Ofsts[type]).mul(lw)
		const dist = Vec2.dot(Vec2.sub(center,st),Vec2[dir])
		Fg.save()
		Fg.setAlpha(0.6)
		Fg.translate(...ofst.vals)
		Fg.lineWidth   = lw
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[type]
		this.#strokePath(g, this.end.stopped? 0:dist)
		Fg.stroke()
		Fg.restore()
	}
	/** @param {Ghost} g */
	#strokePath(g, dist=0) {
		const {center:{x:pX},tilePos:pTile}= p
		let pos = g.tileMid.mul(T)
		Fg.beginPath()
		Fg.moveTo(...g.center.vals)
		Fg.lineTo(...pos.vals)
		for (const [i,{tile,dir,stopped}] of this.#path.entries()) {
			let next = tile.clone.add(.5).mul(T)
			if (i == this.#path.length-1) {
				stopped && tile.eq(pTile) && between(pX,T,BW-T)
					? next.set(p.center)
					: next.add(Vec2[dir].mul(dist))
			}
			if (abs(next.x - pos.x) > T*2) {
				const isL = next.x < pos.x
				Fg.lineTo(isL? BW+T/2 : -T/2, next.y)
				Fg.moveTo(isL? -T/2 : BW+T/2, next.y)
			}
			Fg.lineTo(...next.vals)
			if (i == this.#path.length-1) { // Arrow
				Fg.save()
				Fg.translate(...next.vals)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
			pos = next
		}
	}
	/** @param {Ghost} g */
	update(g) {
		const {tilePos:t}= g, path=[]
		let dir  = g.dir
		let tile = g.passedTileCenter? g.getAdjTile(dir,t):t
		const stoppable = (g.isScattering || g.state.isEscaping)
		if (g.inTunSide && (t.x < 1 || t.x > Cols-2)) tile=t
		path.push({tile,dir,stopped:false})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			let stopped =    tile.eq(p.tilePos) ||
				stoppable && tile.eq(g.targetTile)
			path.push({tile,dir,stopped})
			if (stopped) break
		} this.#path = path
	}
}
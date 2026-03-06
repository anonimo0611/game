import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

const Steps = 15
const Ofsts = /**@type {Readonly<xyTuple[]>}*/
	([[-2,-2], [-1,-1], [1,1], [2,2]])

export class PathMgr {
	/** @param {readonly Ghost[]} ghosts */
	static draw(ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.pathMgr.#draw())
	}
	#path = /**@type {PathNode[]}*/([])
	/** @private @readonly */g
	/** @param {Ghost} ghost */
	constructor(ghost) {this.g = ghost}
	get isAka() {return this.g.type == GhsType.Akabei}
	get isEsc() {return this.g.state.isEscaping}
	get begin() {return this.#path[0]}
	get end()   {return this.#path.at(-1) ?? this.begin}
	get enabled() {
		const {g}= this
		if (Maze.House.arrived(g, T*1.5))  return false
		if (!between(g.center.x, T, BW-T)) return false
		return g.isChasing || g.isScattering || this.isEsc
	}
	#draw() {
		if (!this.enabled || !this.#path.length) return
		const {type,dir,center:gX}= this.g, lw = T/4
		const st   = this.begin.tile.clone.add(.5).mul(T)
		const ofst = Vec2.new(...Ofsts[type]).mul(lw)
		const dist = Vec2.dot(Vec2.sub(gX,st),Vec2[dir])
		Fg.save()
		Fg.setAlpha(0.6)
		Fg.translate(...ofst.vals)
		Fg.lineWidth   = lw
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = GhsColors[type]
		this.#strokePath(this.end.stopped? 0:dist)
		Fg.stroke()
		Fg.restore()
	}
	#strokePath(dist=0) {
		const {center:{x:pX},tilePos:pTile}= p
		let pos = this.g.tilePos.add(.5).mul(T)
		Fg.beginPath()
		Fg.moveTo(...this.g.center.vals)
		Fg.lineTo(...pos.vals)
		this.#path.forEach(({tile,dir,stopped},i,arr)=> {
			let next = tile.clone.add(.5).mul(T)
			if (i == arr.length-1) {
				stopped && tile.eq(pTile) && between(pX,T,BW-T)
					? next.set(p.center)
					: next.add(Vec2[dir].mul(dist))
			}
			if (abs(next.x - pos.x) > T*2) {
				const isR = next.x < pos.x
				Fg.lineTo(isR? BW+T/2 : -T/2, next.y)
				Fg.moveTo(isR? -T/2 : BW+T/2, next.y)
			}
			Fg.lineTo(...next.vals)
			if (i == arr.length-1) { // Arrow
				Fg.save()
				Fg.translate(...next.clone.vals)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
			pos = next
		})
	}
	setPredictedPath() {
		const {g,g:{tilePos:t}}= this, path=[]
		let dir  = g.dir
		let tile = g.passedTileCenter? g.getAdjTile(dir,t):t
		path.push({tile,dir,stopped:false})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			const stopped =
				this.isAka && tile.eq(p.tilePos) ||
				this.isEsc && tile.eq(g.targetTile)
			path.push({tile,dir,stopped})
			if (stopped) break
		} this.#path = path
	}
}
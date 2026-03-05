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
			ghosts.toReversed().forEach(g=> g.pathMgr.draw())
	}
	#path = /**@type {PathNode[]}*/([])
	/** @private @readonly */g
	/** @param {Ghost} ghost */
	constructor(ghost) {this.g = ghost}
	get isAka() {return this.g.type == GhsType.Akabei}
	get isEsc() {return this.g.state.isEscaping}
	get size()  {return this.#path.length}
	get begin() {return this.#path[0]}
	get end()   {return this.#path.at(-1) ?? this.begin}
	get enabled() {
		const {g}= this
		if (Maze.House.arrived(g, T*1.5))  return false
		if (!between(g.center.x, T, BW-T)) return false
		return g.isChasing || g.isScattering || this.isEsc
	}
	draw() {
		if (!this.enabled || !this.#path.length) return
		const {type,dir,center}= this.g, lw = T/4
		const st   = this.begin.tile.clone.add(.5).mul(T)
		const diff = Vec2.sub(center,st)
		const ofst = Vec2.new(...Ofsts[type]).mul(lw)
		const dist = this.end.stopped? 0 : Vec2.dot(diff,Vec2[dir])
		Fg.save()
		Fg.setAlpha(0.6)
		Fg.translate(...ofst.vals)
		Fg.lineWidth   = lw
		Fg.lineCap     = Fg.lineJoin = 'round'
		Fg.strokeStyle = GhsColors[type]
		this.#strokePath(dist)
		this.#strokeArrow(dist)
		Fg.stroke()
		Fg.restore()
	}
	#strokePath(dist=0) {
		let pos = this.g.tilePos.add(.5).mul(T)
		Fg.beginPath()
		Fg.moveTo(...this.g.center.vals)
		Fg.lineTo(...pos.vals)
		this.#path.forEach((node, i) => {
			let next = node.tile.clone.add(.5).mul(T)
			this.#setEndTarget(node, next, dist)
			if (abs(next.x - pos.x) > T*2) {
				const isRightExit = next.x < pos.x
				const margin = T/2
				const exitX  = isRightExit? BW + margin : -margin
				const enterX = isRightExit? -margin : BW + margin
				Fg.lineTo(exitX,  pos.y)
				Fg.moveTo(enterX, next.y)
			}
			Fg.lineTo(...next.vals)
			pos = next
		})
	}
	#strokeArrow(dist=0) {
		const{end}= this, {tile,dir}= end
		const pos = tile.clone.add(.5).mul(T)
		this.#setEndTarget(end,pos,dist)
		Fg.save()
		Fg.translate(...pos.vals)
		Fg.rotate(Dir.Rotation[dir])
		Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
		Fg.restore()
	}
	/** @param {PathNode} node */
	#setEndTarget({stopped,tile,dir}, curr=Vec2.Zero, dist=0) {
		if (tile != this.end.tile) return
		stopped
			&& tile.eq(p.tilePos)
			&& between(p.center.x, T, BW-T)
				? curr.set(p.center)
				: curr.add(Vec2[dir].mul(dist))
	}
	setPredictedPath() {
		const {g,isAka,isEsc}=this, path=[]
		let dir  = g.dir
		let tile = g.passedTileCenter
			? g.getAdjTile(dir, g.tilePos)
			: g.tilePos
		path.push({tile,dir,stopped:false})
		for (let _ of range(Steps-1)) {
			dir  = g.getNextDir(dir,tile)
			tile = g.getAdjTile(dir,tile)
			const stopped =
				isAka && tile.eq(p.tilePos) ||
				isEsc && tile.eq(g.targetTile)
			path.push({tile,dir,stopped})
			if (stopped) break
		}
		this.#path = path
	}
}
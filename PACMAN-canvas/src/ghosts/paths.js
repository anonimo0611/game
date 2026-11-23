import {Dir}   from '@lib/direction.js'
import {Cfg}   from '@/env.js'
import {State} from '@/state.js'
import {Maze}  from '@/maze.js'
import {Ghost,player as p} from '@actors'

const PATH_STEPS  = 18
const LINE_WIDTH  = TS/5
const PathOffsets = freeze([-2,-1,+1,+2])

export class Paths {
	#nodeList = /**@type {PathNode[]}*/([])

	static get isActive() {
		return Cfg.showPaths && State.isInGame
	}

	/** @param {readonly Ghost[]} ghosts */
	static update(ghosts) {
		if (!this.isActive) return
		ghosts.forEach(g=> g.path.#update(g))
	}

	/** @param {readonly Ghost[]} ghosts */
	static draw(ghosts) {
		if (!this.isActive) return
		ghosts.toReversed().forEach(g=> g.path.#draw(g))
	}

	/** @param {Ghost} g */
	#hasFixedTarget(g) {
		return g.isScattering || g.state.isEscaping
	}

	/** @param {Ghost} g */
	#update(g) {
		const {dir,orient}= g
		if (dir != orient || Maze.House.arrived(g, TS*2))
			return
		const tile = g.getAdjTile(dir,g.tile)
		const path = [{dir,tile,stopped:false}]
		for (let i=1; i<PATH_STEPS-1; i++) {
			const {dir:lstDir,tile:t}= path[i-1]
			const tgt  = g.getTargetTile(t)
			const dir  = g.getNextDir(lstDir,t,tgt)
			const tile = g.getAdjTile(dir,t)
			path.push({tile,dir,stopped:
				g.isChasingPac && tile.eq(p.tile) ||
				this.#hasFixedTarget(g) && tile.eq(tgt)
			})
			if (path[i].stopped) break
		} this.#nodeList = path
	}

	/** @param {Ghost} g */
	#draw(g) {
		if (!this.#nodeList.length)
			return
		if (!g.isChasing
		 && !g.isScattering
		 && !g.state.isEscaping)
			return
		const nodes    = this.#nodeList
		const startPos = nodes[0].tile.clone.mul(TS)
		const endTile  = nodes.at(-1)?.tile
		const distance = Vec2.distance(g.pos,startPos)
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(TS/2 + PathOffsets[g.type]*LINE_WIDTH)
		Fg.beginPath()
		Fg.moveTo(...g.pos.vals)
		for (let i=0; i<nodes.length; i++) {
			const {tile,dir,stopped}= nodes[i]
			const curr = tile.clone.mul(TS)
			const last = nodes[i-1]?.tile.clone.mul(TS) ?? g.pos
			if (tile == endTile) {
				stopped && g.isChasingPac
				? curr.set(p.pos)
				: curr.add( Vec2[dir].mul(stopped? 0 : TS/2-distance) )
			}
			if (abs(curr.x - last.x) > TS*3) {
				Fg.lineTo((curr.x < last.x ? BW+TS : -TS), curr.y)
				break
			}
			Fg.lineTo(...curr.vals)
			if (tile == endTile) { // Arrow
				Fg.save()
				Fg.translate(curr)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-TS/2,-TS/2],[0,0],[-TS/2,TS/2])
				Fg.restore()
			}
		}
		Fg.lineWidth   = LINE_WIDTH
		Fg.lineJoin    = Fg.lineCap = 'round'
		Fg.strokeStyle = Color.Ghosts[g.type]
		Fg.stroke()
		Fg.restore()
	}
}
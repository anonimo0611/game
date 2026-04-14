import {Dir}   from '../../_lib/direction.js';
import {Ctrl}  from '../control.js'
import {State} from '../state.js';
import {Maze}  from '../maze.js'
import {Ghost} from './ghost.js';
import {player as p} from '../player/player.js';

const
	LineWidth = T/5,
	PathSteps = 17,
	PathOfsts = freeze([
		-2, // Akabei
		-1, // Pinky
		+1, // Aosuke
		+2, // Guzuta
	])

export class PathMgr {
	#nodeList = /**@type {PathNode[]}*/([])

	static update(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.forEach(g=> g.path.#update(g))
	}
	static draw(/**@type {readonly Ghost[]}*/ghosts) {
		if (State.isInGame && Ctrl.showPaths)
			ghosts.toReversed().forEach(g=> g.path.#draw(g))
	}

	/** @param {Ghost} g */
	#update(g) {
		const {dir,orient}= g
		if (dir != orient || Maze.House.arrived(g, T*2))
			return
		const tile = g.getAdjTile(dir,g.tile)
		const path = [{dir,tile,stopped:false}]
		for (let i=0; i<PathSteps-1; i++) {
			const {dir:d,tile:t}= path[(i+1)-1]
			const tgt  = g.getTargetTile(t)
			const dir  = g.getNextDir(d,t,tgt)
			const tile = g.getAdjTile(dir,t)
			path.push({tile,dir,stopped:
				g.isTargetPac && tile.eq(p.tile) ||
				g.hasFixedTgt && tile.eq(tgt)
			})
			if (path[i+1].stopped) break
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
		const startPos = nodes[0].tile.clone.mul(T)
		const endTile  = nodes.at(-1)?.tile
		const distance = Vec2.distance(g.pos,startPos)
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.translate(T/2 + PathOfsts[g.type]*LineWidth)
		Fg.beginPath()
		Fg.moveTo(...g.pos.vals)
		for (let i=0; i<nodes.length; i++) {
			const {tile,dir,stopped}= nodes[i]
			const curr = tile.clone.mul(T)
			const last = nodes[i-1]?.tile.clone.mul(T) ?? g.pos
			if (tile == endTile) {
				stopped && g.isTargetPac
					? curr.set(p.pos)
					: curr.add(Vec2[dir].mul(stopped? 0 : T/2-distance))
			}
			if (abs(curr.x - last.x) > T*3) {
				Fg.lineTo((curr.x < last.x ? BW+T : -T), curr.y);break
			}
			Fg.lineTo(...curr.vals)
			if (tile == endTile) { // Arrow
				Fg.save()
				Fg.translate(curr)
				Fg.rotate(Dir.Rotation[dir])
				Fg.setLinePath([-T/2,-T/2],[0,0],[-T/2,T/2])
				Fg.restore()
			}
		}
		Fg.lineWidth = LineWidth
		Fg.lineJoin  = Fg.lineCap = 'round'
		Fg.strokeStyle = Palette.Ghosts[g.type]
		Fg.stroke()
		Fg.restore()
	}
}
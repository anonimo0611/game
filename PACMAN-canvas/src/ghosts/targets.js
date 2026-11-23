import {State} from '@/state.js'
import {Cfg}   from '@/env.js'
import {Maze}  from '@/maze.js'
import {GUZUTA_THRESHOLD}    from './ghost_sub.js'
import {Ghosts,Ghost,player} from '@actors'

export const Targets = new class TargetVisualizer {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!State.isInGame)  return
		if (!Cfg.showTargets) return
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.setStyle('#FFF')
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawMarker(g)
		Fg.restore()
	}

	/** @param {Ghost} g */
	#markerDisabled = g=>
		  (g.isFrightened
		|| g.state.isIdle
		|| g.state.isBitten
		|| (Timer.frozen && !g.isEscaping))

	/** @param {Ghost} g */
	#getTargetPos = g=>
		(g.state.isGoingOut || g.isEscaping)
			? Maze.House.EntryTile.add(.5).mul(TS)
			: g.isScattering
				? g.baseTargetTile.add(.5).mul(TS)
				: g.chasePos

	/** @param {Ghost} g */
	#strokeLines(g) {
		if (Timer.frozen
		 || g.type == GhostType.Akabei
		 || g.isChasing == false)
			return
		g.type == GhostType.Guzuta
			? this.#guzutaCircle(g)
			: this.#auxLines(g, g.chaseOffset)
	}

	/** @param {Ghost} g */
	#drawMarker(g) {
		if (this.#markerDisabled(g))
			return
		const size = TS*0.6
		const {x,y}= this.#getTargetPos(g).sub(size/2)
		Fg.lineWidth = TS*0.1
		Fg.fillStyle = Color.GhostBodies[g.type]
		Fg.fillRect  (x,y, size,size)
		Fg.strokeRect(x,y, size,size)
	}

	/** @param {Ghost}  g */
	#auxLines(g, ofst=TS*2) {
		const {center:{x,y},dir,inTunSide}= player
		const fwdXY  = player.forward(dir, ofst).vals
		const ofsXY  = player.offsetTarget(ofst).vals
		Fg.lineWidth = TS*0.2
		if (g.type == GhostType.Pinky && !inTunSide
		 || g.type == GhostType.Aosuke) {
			dir != DirU
				? Fg.newLinePath([x,y], fwdXY)
				: Fg.newLinePath([x,y], fwdXY, ofsXY)
			Fg.stroke()
		}
		if (g.type == GhostType.Aosuke) {
			const akaXY = Ghosts.of(GhostType.Akabei).center.vals
			Fg.newLinePath(akaXY, ofsXY, g.chasePos.vals).stroke()
			Fg.fillCircle(...ofsXY, TS*0.26|0)
		}
	}

	/** @param {Ghost} g */
	#guzutaCircle(g) {
		const th = TS*GUZUTA_THRESHOLD
		Fg.save()
		Fg.translate(player.center)
		Fg.setAlpha(Vec2.sqrMag(g,player) < th**2 ? 0.8 : 0.4)
		Fg.strokeCircle(0,0, th, undefined, TS*0.15)
		Fg.restore()
	}
}
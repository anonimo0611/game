import {State}  from '../state.js'
import {Cfg}    from '../control.js'
import {player} from '../player/player.js'
import {Maze}   from '../maze.js'
import {Ghosts} from './_system.js'
import {Ghost}  from './ghost.js'
import {Akabei,Pinky,Aosuke,Guzuta} from './ghost_sub.js'

export const Targets = new class TargetVisualizer {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!State.isInGame)  return
		if (!Cfg.showTargets) return
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.fillStyle = Fg.strokeStyle = '#FFF'
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawMarker(g)
		Fg.restore()
	}
	/** @param {Ghost} g */
	#markerDisabled = g=> (
		   g.isFrightened
		|| g.state.isIdle
		|| g.state.isBitten
		|| (Timer.frozen && !g.isEscaping)
	)
	/** @param {Ghost} g */
	#getTargetPos = g=>
		(g.state.isGoingOut || g.isEscaping)
			? Maze.House.EntryTile.add(.5).mul(T)
			: g.isScattering
				? g.baseTargetTile.add(.5).mul(T)
				: g.chasePos

	/** @param {Ghost} g */
	#strokeLines(g) {
		if (Timer.frozen
		 || g instanceof Akabei
		 || g.isChasing == false)
			return
		g instanceof Guzuta
			? this.#guzutaCircle(g)
			: this.#auxLines(g, g.chaseOffset)
	}
	/** @param {Ghost} g */
	#drawMarker(g) {
		if (this.#markerDisabled(g))
			return
		const size = T*0.6
		const {x,y}= this.#getTargetPos(g).sub(size/2)
		Fg.lineWidth = T*0.1
		Fg.fillStyle = Color.GhostBodies[g.type]
		Fg.fillRect  (x,y, size,size)
		Fg.strokeRect(x,y, size,size)
	}
	/** @param {Pinky|Aosuke}  g */
	#auxLines(g, ofst=2) {
		const {center:{x,y},dir,inTunSide}= player
		const fwdXY  = player.forwardPos(ofst).vals
		const ofsXY  = player.offsetTarget(ofst).vals
		Fg.lineWidth = T*0.2
		if (g instanceof Pinky && !inTunSide
		 || g instanceof Aosuke) {
			dir != U
				? Fg.newLinePath([x,y], fwdXY)
				: Fg.newLinePath([x,y], fwdXY, ofsXY)
			Fg.stroke()
		}
		if (g instanceof Aosuke) {
			const akaXY = Ghosts.of(GhostType.Akabei).center.vals
			Fg.newLinePath(akaXY, ofsXY, g.chasePos.vals).stroke()
			Fg.fillCircle(...ofsXY, 8)
		}
	}
	/** @param {Guzuta} g */
	#guzutaCircle(g) {
		Fg.save()
		Fg.translate(player.center)
		Fg.setAlpha(g.isTargetPac ? 0.8 : 0.4)
		Fg.strokeCircle(0,0, T*Guzuta.THRESHOLD, undefined, T*0.15)
		Fg.restore()
	}
}
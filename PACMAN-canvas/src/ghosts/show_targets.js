import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {player} from '../player/player.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './ghost.js'
import {GuzutaThreshold} from './ghost_sub.js'

export default new class {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!Ctrl.showTargets) return
		if (!State.isInGame) return
		Fg.save()
		Fg.setAlpha(0.7)
		Fg.fillStyle = Fg.strokeStyle = '#FFF'
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawMarker(g)
		Fg.restore()
	}
	/** @param {Ghost} g */
	markerDisabled = g=> (
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
		 || g.type == GhsType.Akabei
		 || g.isChasing == false)
			return
		g.type == GhsType.Guzuta
			? this.#guzutaCircle(g)
			: this.#auxLines(g, g.chaseOffset)
	}
	/** @param {Ghost} g */
	#drawMarker(g) {
		if (this.markerDisabled(g))
			return
		const size = T*0.6
		const {x,y}= this.#getTargetPos(g).sub(size/2)
		Fg.lineWidth = T*0.1
		Fg.fillStyle = GhsColors[g.type]
		Fg.fillRect  (x,y, size,size)
		Fg.strokeRect(x,y, size,size)
	}
	/**
	 @param {Ghost}  g
	 @param {number} ofst
	*/
	#auxLines(g, ofst) {
		const {center:{x,y},dir,inTunSide}= player
		const fwdXY = player.forwardPos(ofst).vals
		const ofsXY = player.offsetTarget(ofst).vals
		Fg.lineWidth = T*0.2
		if (g.type == GhsType.Pinky && !inTunSide
		 || g.type == GhsType.Aosuke) {
			dir != U
				? Fg.newLinePath([x,y], fwdXY)
				: Fg.newLinePath([x,y], fwdXY).lineTo(...ofsXY)
			Fg.stroke()
		}
		if (g.type == GhsType.Aosuke) {
			const tgtXY = g.chasePos.vals
			const akaXY = GhsMgr.akaCenterPos.vals
			Fg.newLinePath(akaXY, ofsXY, tgtXY).stroke()
			Fg.fillCircle(...ofsXY, 8)
		}
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		Fg.save()
		Fg.translate(...player.center.vals)
		Fg.setAlpha(g.chasePos.eq(player.center) ? 0.8 : 0.4)
		Fg.strokeCircle(0,0, T*GuzutaThreshold, '#FFF', T*0.15)
		Fg.restore()
	}
}